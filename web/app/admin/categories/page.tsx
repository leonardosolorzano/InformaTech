"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import type { CategoryRead } from "@/lib/types";

const inputClassName =
  "min-h-11 w-full rounded-xl border border-[#deded5] bg-white px-4 text-sm outline-none transition focus:border-[#171717]";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function load() {
    const res = await fetch("/api/admin/categories", { cache: "no-store" });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return (await res.json()) as CategoryRead[];
  }

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const data = await load();
        if (active) setCategories(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error cargando categorías");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
  }

  function startEdit(category: CategoryRead) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description ?? "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        editingId
          ? `/api/admin/categories/${editingId}`
          : "/api/admin/categories",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Error ${res.status}`);
      }
      setCategories(await load());
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  }

  async function remove(category: CategoryRead) {
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Error ${res.status}`);
      }
      setCategories(await load());
      if (editingId === category.id) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight">Categorías</h1>
        <p className="mt-1 text-sm text-[#686860]">
          Organiza el contenido del portal creando y editando categorías.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 self-start rounded-2xl border border-black/10 bg-white p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {editingId ? "Editar categoría" : "Nueva categoría"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#686860] hover:text-[#171717]"
              >
                <X className="size-3" />
                Cancelar
              </button>
            )}
          </div>
          <div>
            <label htmlFor="cat-name" className="text-sm font-semibold">
              Nombre
            </label>
            <input
              id="cat-name"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-2 ${inputClassName}`}
              placeholder="Inteligencia Artificial"
            />
          </div>
          <div>
            <label htmlFor="cat-desc" className="text-sm font-semibold">
              Descripción
            </label>
            <textarea
              id="cat-desc"
              maxLength={1000}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`mt-2 ${inputClassName}`}
              placeholder="Descripción breve (opcional)"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 text-sm font-bold text-white transition hover:bg-[#353535] disabled:opacity-65"
          >
            {busy ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {editingId ? "Guardar cambios" : "Crear categoría"}
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          {loading ? (
            <p className="p-6 text-sm text-[#686860]">Cargando...</p>
          ) : categories.length === 0 ? (
            <p className="p-6 text-sm text-[#686860]">Aún no hay categorías.</p>
          ) : (
            <ul className="divide-y divide-black/5">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex items-start justify-between gap-4 px-6 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-xs text-[#686860]">/{category.slug}</p>
                    {category.description && (
                      <p className="mt-1 text-sm text-[#55554e]">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => startEdit(category)}
                      className="grid size-8 place-items-center rounded-lg border border-black/10 transition hover:bg-black/5"
                      title="Editar"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => remove(category)}
                      className="grid size-8 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                      title="Eliminar"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
