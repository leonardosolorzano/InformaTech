"use client";

import { LoaderCircle, Pencil, Trash2 } from "lucide-react";

import type { CategoryRead } from "@/lib/types";

interface CategoryListProps {
  categories: CategoryRead[];
  loading: boolean;
  onEdit: (category: CategoryRead) => void;
  onRemove: (category: CategoryRead) => void;
}

/** Listado de categorías existentes con acciones de editar/eliminar. */
export function CategoryList({
  categories,
  loading,
  onEdit,
  onRemove,
}: CategoryListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      {loading ? (
        <p className="flex items-center gap-2 p-6 text-sm text-[#686860]">
          <LoaderCircle className="size-4 animate-spin" />
          Cargando...
        </p>
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
                  onClick={() => onEdit(category)}
                  className="grid size-8 place-items-center rounded-lg border border-black/10 transition hover:bg-black/5"
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => onRemove(category)}
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
  );
}
