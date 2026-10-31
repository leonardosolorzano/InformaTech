"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ArticleForm from "@/components/admin/articles/article-form";
import { FormMessage } from "@/components/shared/form-message";
import { toErrorMessage } from "@/lib/errors";
import { fetchJson } from "@/lib/http";
import type { ArticleRead } from "@/lib/types";

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [article, setArticle] = useState<ArticleRead | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    fetchJson<ArticleRead>(`/api/admin/articles/${id}`, { cache: "no-store" })
      .then((data) => {
        if (active) setArticle(data);
      })
      .catch((err) => {
        if (active) setError(toErrorMessage(err, "Error cargando artículo"));
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return <FormMessage tone="error">{error}</FormMessage>;
  }

  if (!article) {
    return <p className="text-sm text-[#686860]">Cargando artículo...</p>;
  }

  return <ArticleForm article={article} />;
}
