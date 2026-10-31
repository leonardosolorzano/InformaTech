import { Clock3 } from "lucide-react";
import Image from "next/image";

import { getImageUrl } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { ArticleRead } from "@/lib/types";

/** Vista completa de un artículo (usada por la página `/noticias/[slug]`). */
export function ArticleView({ article }: { article: ArticleRead }) {
  const cover = getImageUrl(article.cover_image_url);

  return (
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
          {formatDate(article.published_at)}
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

      <p className="mt-8 text-lg leading-relaxed text-[#5d5d58]">
        {article.summary}
      </p>

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
  );
}
