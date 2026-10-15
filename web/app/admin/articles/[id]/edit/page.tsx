"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ArticleRead } from "@/lib/types";
import ArticleForm from "../../article-form";

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [article, setArticle] = useState<ArticleRead | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    void (async () => {
      try {
        const res = await fetch(`/api/admin/articles/${id}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || `Error ${res.status}`);
        }
        const data = (await res.json()) as ArticleRead;
        if (active) setArticle(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error cargando artículo");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (!article) {
    return <p className="text-sm text-[#686860]">Cargando artículo...</p>;
  }

  return <ArticleForm article={article} />;
}
