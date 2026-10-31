"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { ArticlesTable } from "@/components/admin/articles/articles-table";
import { ArticlesToolbar } from "@/components/admin/articles/articles-toolbar";
import { FormMessage } from "@/components/shared/form-message";
import { useAdminArticles } from "@/hooks/use-articles";
import type { ArticleListItem } from "@/lib/types";

export default function AdminArticlesPage() {
  const {
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
  } = useAdminArticles();

  function handleRemove(item: ArticleListItem) {
    if (!window.confirm(`¿Eliminar "${item.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    void remove(item.id);
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

      <ArticlesToolbar
        status={status}
        query={query}
        onStatusChange={setStatus}
        onQueryChange={setQuery}
      />

      {error && <FormMessage tone="error">{error}</FormMessage>}

      <ArticlesTable
        data={data}
        loading={loading}
        busy={busy}
        onTogglePublish={togglePublish}
        onRemove={handleRemove}
      />

      {data && data.total > 0 && (
        <p className="text-xs text-[#77776f]">
          {data.total} artículo(s) en total
        </p>
      )}
    </div>
  );
}
