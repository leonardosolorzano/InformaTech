"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { ArticleListItem, ArticleStatus, Page } from "@/lib/types";
import { toast } from "sonner";

const STATUS_STYLES: Record<ArticleStatus, string> = {
  draft: "bg-black/10 text-[#3f3f38]",
  pending: "bg-[#ffe08a] text-[#6b5300]",
  published: "bg-[#d8ff48] text-[#3f5200]",
  rejected: "bg-[#ffd0d0] text-[#8a1f1f]",
};

const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "Borrador",
  pending: "En revisión",
  published: "Publicado",
  rejected: "Rechazado",
};

const FILTERS: { value: ArticleStatus | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "pending", label: "En revisión" },
  { value: "draft", label: "Borradores" },
  { value: "rejected", label: "Rechazados" },
];

export default function AdminArticlesPage() {
  const [data, setData] = useState<Page<ArticleListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ArticleStatus | "">("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async (statusFilter: ArticleStatus | "", q: string) => {
    const search = new URLSearchParams({ page: "1", size: "50" });
    if (statusFilter) search.set("status", statusFilter);
    if (q.trim().length >= 2) search.set("q", q.trim());
    const res = await fetch(`/api/admin/articles?${search.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `Error ${res.status}`);
    }
    return (await res.json()) as Page<ArticleListItem>;
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      void (async () => {
        try {
          const result = await load(status, query);
          if (active) {
            setData(result);
            setError(null);
          }
        } catch (err) {
          if (active) {
            setError(err instanceof Error ? err.message : "Error cargando artículos");
          }
        } finally {
          if (active) setLoading(false);
        }
      })();
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [status, query, load]);

  async function remove(id: number, title: string) {
    if (!window.confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Error ${res.status}`);
      }
      toast.success("Artículo eliminado correctamente");
      setData(await load(status, query));
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo eliminar";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(null);
    }
  }

  async function togglePublish(item: ArticleListItem) {
    setBusy(item.id);
    setError(null);
    try {
      const newStatus = item.status === "published" ? "draft" : "published";
      const res = await fetch(`/api/admin/articles/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Error ${res.status}`);
      }
      toast.success(
        newStatus === "published"
          ? "Artículo publicado correctamente"
          : "Artículo despublicado correctamente"
      );
      setData(await load(status, query));
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Artículos</h1>
          <p className="mt-1 text-sm text-[#686860]">
            Crea, edita, publica o elimina contenido del portal.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 text-sm font-bold text-white transition hover:bg-[#353535]"
        >
          <Plus className="size-4" />
          Nueva publicación
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={[
                "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition",
                status === f.value
                  ? "bg-[#171717] text-white"
                  : "border border-black/10 bg-white hover:bg-black/5",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título..."
          className="ml-auto min-h-10 w-full max-w-xs rounded-xl border border-[#deded5] bg-white px-4 text-sm outline-none focus:border-[#171717]"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-[#686860]">Cargando artículos...</p>
        ) : !data || data.items.length === 0 ? (
          <p className="p-6 text-sm text-[#686860]">
            No hay artículos con este filtro.
          </p>
        ) : (
          <table className="min-w-full divide-y divide-black/5 text-sm">
            <thead className="bg-[#f8f7f3]">
              <tr>
                <th className="px-6 py-3 text-left font-bold uppercase tracking-[0.12em] text-[#686860]">
                  Título
                </th>
                <th className="px-6 py-3 text-left font-bold uppercase tracking-[0.12em] text-[#686860]">
                  Estado
                </th>
                <th className="px-6 py-3 text-left font-bold uppercase tracking-[0.12em] text-[#686860]">
                  Autor
                </th>
                <th className="px-6 py-3 text-left font-bold uppercase tracking-[0.12em] text-[#686860]">
                  Visitas
                </th>
                <th className="px-6 py-3 text-right font-bold uppercase tracking-[0.12em] text-[#686860]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {data.items.map((item) => (
                <tr key={item.id} className="hover:bg-[#f8f7f3]/60">
                  <td className="max-w-md px-6 py-4">
                    <p className="font-semibold">{item.title}</p>
                    <p className="truncate text-xs text-[#686860]">
                      {item.category.name}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${STATUS_STYLES[item.status]}`}
                    >
                      {STATUS_LABELS[item.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#686860]">
                    @{item.author.username}
                  </td>
                  <td className="px-6 py-4 text-[#686860]">{item.views_count}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {busy === item.id ? (
                        <LoaderCircle className="size-4 animate-spin text-[#686860]" />
                      ) : (
                        <>
                          <button
                            onClick={() => togglePublish(item)}
                            className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-black/5"
                            title={
                              item.status === "published"
                                ? "Despublicar"
                                : "Publicar"
                            }
                          >
                            {item.status === "published" ? "Despublicar" : "Publicar"}
                          </button>
                          <Link
                            href={`/admin/articles/${item.id}/edit`}
                            className="grid size-8 place-items-center rounded-lg border border-black/10 transition hover:bg-black/5"
                            title="Editar"
                          >
                            <Pencil className="size-4" />
                          </Link>
                          {item.status === "published" && (
                            <Link
                              href={`/noticias/${item.slug}`}
                              target="_blank"
                              className="grid size-8 place-items-center rounded-lg border border-black/10 transition hover:bg-black/5"
                              title="Ver"
                            >
                              <Eye className="size-4" />
                            </Link>
                          )}
                          <button
                            onClick={() => remove(item.id, item.title)}
                            className="grid size-8 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                            title="Eliminar"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.total > 0 && (
        <p className="text-xs text-[#77776f]">
          {data.total} artículo(s) en total
        </p>
      )}
    </div>
  );
}
