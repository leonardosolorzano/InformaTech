"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { getImageUrl } from "@/lib/api";
import type { ArticleListItem } from "@/lib/types";

const ROTATION_MS = 4000;
const MAX_ITEMS = 3;

async function fetchFeatured(): Promise<ArticleListItem[]> {
  const res = await fetch(`/api/articles/featured?limit=${MAX_ITEMS}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return (await res.json()) ?? [];
}

const FeaturedMain = () => {
  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchFeatured().then(setItems);
  }, []);

  // Rotación automática cada 4 segundos.
  useEffect(() => {
    if (!mounted || items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, ROTATION_MS);
    return () => clearInterval(timer);
  }, [mounted, items.length]);

  const goTo = useCallback((next: number) => {
    setIndex(((next % items.length) + items.length) % items.length);
  }, [items.length]);

  const prev = useCallback(() => goTo(index - 1), [index, goTo]);
  const next = useCallback(() => goTo(index + 1), [index, goTo]);

  const active = items[index];
  if (!mounted || items.length === 0) {
    return (
      <section className="max-w-7xl m-auto grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:py-24">
        <div>
          <p className="mb-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#696963]">
            <span className="size-2 rounded-full bg-[#d8ff48]" /> En portada · 01
          </p>
          <h1 className="max-w-2xl font-serif text-[clamp(3.6rem,7.5vw,7.8rem)] leading-[.87] tracking-[-0.075em]">
            La tecnología <em className="font-serif font-normal text-[#77776f]">también</em> necesita silencio.
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

  const cover = getImageUrl(active.cover_image_url);

  return (
    <section className="max-w-7xl m-auto grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:py-24">
      {/* Texto a la izquierda */}
      <div>
        <p className="mb-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#696963]">
          <span className="size-2 rounded-full bg-[#d8ff48]" /> En portada · {index + 1}
        </p>

        <Link href={`/noticias/${active.slug}`} className="group block">
          <h1 className="max-w-2xl font-serif text-[clamp(3.6rem,7.5vw,7.8rem)] leading-[.87] tracking-[-0.075em] group-hover:text-[#67675f] transition-colors">
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
        {items.map((item, i) => {
          const isActive = i === index;
          const itemCover = getImageUrl(item.cover_image_url);
          return (
            <div
              key={item.id}
              className={`absolute inset-0 flex flex-col ${
                isActive
                  ? "opacity-100 translate-x-0 pointer-events-auto z-10"
                  : "opacity-0 -translate-x-4 pointer-events-none"
              } transition-all duration-500 ease-in-out`}
            >
              {itemCover && item ? (
                <Image
                  src={itemCover}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : null}
              <div className="absolute bottom-5 left-5 bg-[#f8f7f3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em]">
                {item.category?.name ?? "Ensayo · Tecnología humana"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controles abajo de la imagen */}
      <div className="col-span-full flex items-center justify-between gap-6 pt-6 lg:pt-10">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#696963]">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                i === index
                  ? "bg-[#171717] w-3"
                  : "bg-black/20 hover:bg-black/40"
              }`}
              aria-label={`Ir a la noticia ${i + 1}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={prev}
            disabled={items.length <= 1}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-black/20 bg-[#f8f7f3] text-[#171717] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-[#171717] hover:text-white"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={next}
            disabled={items.length <= 1}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-black/20 bg-[#f8f7f3] text-[#171717] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-[#171717] hover:text-white"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMain;
