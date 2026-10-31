import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ArticleView } from "@/components/noticias/article-view";
import Footer from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { apiEndpoints } from "@/lib/api";
import { ApiError } from "@/lib/errors";
import { fetchApiServer } from "@/lib/server/api";
import type { ArticleRead } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await fetchApiServer<ArticleRead>(apiEndpoints.articles.get(slug));
    return {
      title: article.title,
      description: article.summary,
    };
  } catch {
    return { title: "Artículo no encontrado" };
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  let article: ArticleRead | null = null;
  let error: string | null = null;
  try {
    article = await fetchApiServer<ArticleRead>(apiEndpoints.articles.get(slug));
  } catch (e) {
    error = e instanceof ApiError ? e.message : "Error al cargar el artículo";
  }

  return (
    <div className="min-h-screen bg-[#f8f7f3] text-[#171717] selection:bg-[#d8ff48] selection:text-black">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-16">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] hover:text-[#77776f]"
        >
          <ArrowLeft className="size-4" /> Volver al inicio
        </Link>

        {error || !article ? (
          <div className="py-20 text-center">
            <h1 className="font-serif text-4xl">Artículo no disponible</h1>
            {error && <p className="mt-4 text-sm text-[#77776f]">{error}</p>}
          </div>
        ) : (
          <ArticleView article={article} />
        )}
      </main>

      <Footer />
    </div>
  );
}
