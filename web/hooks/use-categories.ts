"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toErrorMessage } from "@/lib/errors";
import { fetchJson } from "@/lib/http";
import type { CategoryRead } from "@/lib/types";

/**
 * CRUD de categorías del panel admin: listado, alta/edición (el formulario
 * comparte el estado de edición con la lista) y borrado.
 */
export function useCategories() {
  const [categories, setCategories] = useState<CategoryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = useCallback(
    () =>
      fetchJson<CategoryRead[]>("/api/admin/categories", { cache: "no-store" }),
    []
  );

  useEffect(() => {
    let active = true;
    load()
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch((err) => {
        if (active) setError(toErrorMessage(err, "Error cargando categorías"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setName("");
    setDescription("");
  }, []);

  const startEdit = useCallback((category: CategoryRead) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description ?? "");
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setBusy(true);
      setError(null);
      try {
        await fetchJson<CategoryRead>(
          editingId
            ? `/api/admin/categories/${editingId}`
            : "/api/admin/categories",
          {
            method: editingId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name.trim(),
              description: description.trim() || null,
            }),
          }
        );
        setCategories(await load());
        resetForm();
      } catch (err) {
        setError(toErrorMessage(err, "No se pudo guardar"));
      } finally {
        setBusy(false);
      }
    },
    [editingId, name, description, load, resetForm]
  );

  const remove = useCallback(
    async (category: CategoryRead) => {
      setError(null);
      try {
        await fetchJson<void>(`/api/admin/categories/${category.id}`, {
          method: "DELETE",
        });
        setCategories(await load());
        if (editingId === category.id) resetForm();
      } catch (err) {
        setError(toErrorMessage(err, "No se pudo eliminar"));
      }
    },
    [editingId, load, resetForm]
  );

  return {
    categories,
    loading,
    error,
    busy,
    editingId,
    name,
    description,
    setName,
    setDescription,
    handleSubmit,
    remove,
    startEdit,
    resetForm,
  };
}
