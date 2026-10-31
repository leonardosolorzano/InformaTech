"use client";

import Link from "next/link";
import { Eye, LoaderCircle, Pencil, Trash2 } from "lucide-react";

import { ArticleStatusBadge } from "./article-status-badge";
import type { ArticleListItem, Page } from "@/lib/types";

interface ArticlesTableProps {
  data: Page<ArticleListItem> | null;
  loading: boolean;
  busy: number | null;
  onTogglePublish: (item: ArticleListItem) => void;
  onRemove: (item: ArticleListItem) => void;
}

/** Tabla del listado de artículos del panel admin. */
export function ArticlesTable({
  data,
  loading,
  busy,
  onTogglePublish,
  onRemove,
}: ArticlesTableProps) {
  return (
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
                  <ArticleStatusBadge status={item.status} />
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
                          onClick={() => onTogglePublish(item)}
                          className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-black/5"
                          title={
                            item.status === "published"
                              ? "Despublicar"
                              : "Publicar"
                          }
                        >
                          {item.status === "published"
                            ? "Despublicar"
                            : "Publicar"}
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
                          onClick={() => onRemove(item)}
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
  );
}
