import { useState } from "react";
import { Link } from "react-router-dom";
import type { Article } from "../types";

const GRADIENTS = [
  "from-primary via-primary-light to-primary-dark",
  "from-primary-dark via-primary to-primary-light",
  "from-primary-light via-primary-dark to-primary",
];

interface Props {
  articles: Article[];
}

export default function HeroSlider({ articles }: Props) {
  const [current, setCurrent] = useState(0);
  const featured = articles.slice(0, 3);

  if (featured.length === 0) return null;

  const article = featured[current];

  return (
    <section className="relative overflow-hidden mb-10">
      <div
        className={`relative bg-gradient-to-br ${GRADIENTS[current]} min-h-[400px] md:min-h-[480px] flex items-center`}
      >
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 px-8 md:px-14 py-12 md:py-16 max-w-3xl">
          {article.category && (
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-white/20 text-white mb-4">
              {article.category}
            </span>
          )}

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            {article.title.length > 80
              ? article.title.slice(0, 80) + "..."
              : article.title}
          </h2>

          <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
            {article.content.slice(0, 200)}
            {article.content.length > 200 ? "..." : ""}
          </p>

          <div className="flex items-center gap-4">
            <Link
              to={`/articles/${article.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold hover:bg-white/90 transition shadow-lg"
            >
              Leer más
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <span className="text-white/60 text-sm">
              {article.minutes_to_read} min de lectura
            </span>
          </div>
        </div>
      </div>

      {featured.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-6 h-1 transition-all ${
                i === current
                  ? "bg-white"
                  : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      {featured.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrent((p) => (p === 0 ? featured.length - 1 : p - 1))
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/20 text-white/80 hover:bg-black/40 hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() =>
              setCurrent((p) => (p === featured.length - 1 ? 0 : p + 1))
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/20 text-white/80 hover:bg-black/40 hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}
