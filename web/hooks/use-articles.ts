"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { toErrorMessage } from "@/lib/errors";
import { fetchJson } from "@/lib/http";
import type { ArticleListItem, ArticleRead, ArticleStatus, Page } from "@/lib/types";

const PAGE_SIZE = 50;
const SEARCH_MIN_LENGTH = 2;
const DEBOUNCE_MS = 250;

/**
 * Listado de artículos del panel admin: carga con debounce, borrado,
 * publicar/despublicar y filtros por estado y búsqueda.
 */
export function useAdminArticles() {
  const [data, setData] = useState<Page<ArticleListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [status, setStatus] = useState<ArticleStatus | "">("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const search = new URLSearchParams({ page: "1", size: String(PAGE_SIZE) });
    if (status) search.set("status", status);
    if (query.trim().length >= SEARCH_MIN_LENGTH) search.set("q", query.trim());
    return fetchJson<Page<ArticleListItem>>(
      `/api/admin/articles?${search.toString()}`,
      { cache: "no-store" }
    );
  }, [status, query]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      load()
        .then((result) => {
          if (!active) return;
          setData(result);
          setError(null);
        })
        .catch((err) => {
          if (active) setError(toErrorMessage(err, "Error cargando artículos"));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [load]);

  const reload = useCallback(async () => {
    setData(await load());
  }, [load]);

  const remove = useCallback(
    async (id: number) => {
      setBusy(id);
      setError(null);
      try {
        await fetchJson<void>(`/api/admin/articles/${id}`, { method: "DELETE" });
        toast.success("Artículo eliminado correctamente");
        await reload();
      } catch (err) {
        const message = toErrorMessage(err, "No se pudo eliminar");
        setError(message);
        toast.error(message);
      } finally {
        setBusy(null);
      }
    },
    [reload]
  );

  const togglePublish = useCallback(
    async (item: ArticleListItem) => {
      setBusy(item.id);
      setError(null);
      try {
        const newStatus = item.status === "published" ? "draft" : "published";
        await fetchJson<ArticleRead>(`/api/admin/articles/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
          }),
        });
        toast.success(
          newStatus === "published"
            ? "Artículo publicado correctamente"
            : "Artículo despublicado correctamente"
        );
        await reload();
      } catch (err) {
        const message = toErrorMessage(err, "No se pudo actualizar");
        setError(message);
        toast.error(message);
      } finally {
        setBusy(null);
      }
    },
    [reload]
  );

  return {
    data,
    loading,
    error,
    busy,
    status,
    query,
    setStatus,
    setQuery,
    remove,
    togglePublish,
  };
}
