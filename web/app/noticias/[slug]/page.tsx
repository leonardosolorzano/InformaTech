import { ArrowLeft, Clock3 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Header } from "@/app/components/header";
import FooterSection from "@/app/components/footer";
import { fetchApiServer } from "@/lib/server/api";
import { apiEndpoints, getImageUrl } from "@/lib/api";
import { ApiError } from "@/lib/api";
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

  const cover = article ? getImageUrl(article.cover_image_url) : null;

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
          <article>
            <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a7a72]">
              {article.category?.name ?? "General"} ·{" "}
              {article.author?.username ?? "Autor"}
            </p>
            <h1 className="font-serif text-4xl leading-[1.05] tracking-[-0.04em] sm:text-5xl">
              {article.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[#85857d]">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="size-3" />
                {article.published_at
                  ? new Date(article.published_at).toLocaleDateString("es", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Recientemente"}
              </span>
              <span>{article.views_count} vistas</span>
            </div>

            {cover && (
              <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-[#e9e7df]">
                <Image
                  src={cover}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            )}

            <p className="mt-8 text-lg leading-relaxed text-[#5d5d58]">{article.summary}</p>

            <div className="mt-8 space-y-6 text-[17px] leading-relaxed text-[#171717]">
              {article.content.split(/\n{2,}/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {article.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="border border-black/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </article>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
