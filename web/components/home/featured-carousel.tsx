"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { useCarousel } from "@/hooks/use-carousel";
import { fetchJson } from "@/lib/http";
import type { ArticleListItem } from "@/lib/types";
import { FeaturedSlide } from "./featured-slide";

const MAX_ITEMS = 3;

async function fetchFeatured(): Promise<ArticleListItem[]> {
  try {
    const data = await fetchJson<ArticleListItem[]>(
      `/api/articles/featured?limit=${MAX_ITEMS}`,
      { cache: "no-store" }
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Hero de portada: carrusel con los artículos destacados. */
export default function FeaturedCarousel() {
  const [items, setItems] = useState<ArticleListItem[]>([]);
  const { index, goTo, prev, next } = useCarousel(items.length);

  useEffect(() => {
    fetchFeatured().then(setItems);
  }, []);

  if (items.length === 0) {
    return <FeaturedPlaceholder />;
  }

  const active = items[index];

  return (
    <section className="max-w-7xl m-auto grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:py-24">
      {/* Texto a la izquierda */}
      <div>
        <p className="mb-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#696963]">
          <span className="size-2 rounded-full bg-[#d8ff48]" /> En portada ·{" "}
          {index + 1}
        </p>

        <Link href={`/noticias/${active.slug}`} className="group block">
          <h1 className="max-w-2xl font-serif text-[clamp(3.6rem,7.5vw,7.8rem)] leading-[.87] tracking-[-0.075em] transition-colors group-hover:text-[#67675f]">
            {active.title}
          </h1>
          <p className="mt-9 max-w-md text-[17px] leading-relaxed text-[#5d5d58]">
            {active.summary}
          </p>
          <span className="mt-10 inline-flex items-center gap-3 border-b border-black pb-2 text-xs font-bold uppercase tracking-[0.16em] transition-all hover:gap-5">
            Leer la historia <ArrowRight className="size-4" />
          </span>
        </Link>
      </div>

      {/* Imagen con slides apilados */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#dedbd1] lg:aspect-[5/6]">
        {items.map((item, i) => (
          <FeaturedSlide key={item.id} item={item} isActive={i === index} />
        ))}
      </div>

      {/* Controles */}
      <div className="col-span-full flex items-center justify-between gap-6 pt-6 lg:pt-10">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#696963]">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === index ? "w-3 bg-[#171717]" : "w-1.5 bg-black/20 hover:bg-black/40"
              }`}
              aria-label={`Ir a la noticia ${i + 1}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={prev}
            disabled={items.length <= 1}
            aria-label="Noticia anterior"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 bg-[#f8f7f3] text-xs font-bold text-[#171717] transition-all hover:bg-[#171717] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={next}
            disabled={items.length <= 1}
            aria-label="Siguiente noticia"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 bg-[#f8f7f3] text-xs font-bold text-[#171717] transition-all hover:bg-[#171717] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/** Estado vacío mientras carga o cuando no hay destacados. */
function FeaturedPlaceholder() {
  return (
    <section className="max-w-7xl m-auto grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:py-24">
      <div>
        <p className="mb-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#696963]">
          <span className="size-2 rounded-full bg-[#d8ff48]" /> En portada · 01
        </p>
        <h1 className="max-w-2xl font-serif text-[clamp(3.6rem,7.5vw,7.8rem)] leading-[.87] tracking-[-0.075em]">
          La tecnología{" "}
          <em className="font-serif font-normal text-[#77776f]">también</em>{" "}
          necesita silencio.
        </h1>
      </div>
      <div className="relative aspect-[4/5] overflow-hidden bg-[#dedbd1] lg:aspect-[5/6]">
        <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#aaa99f]">
          Sin destacados
        </div>
      </div>
    </section>
  );
}
