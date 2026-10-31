"use client";

import type { ArticleStatus } from "@/lib/types";

const FILTERS: { value: ArticleStatus | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "published", label: "Publicados" },
  { value: "pending", label: "En revisión" },
  { value: "draft", label: "Borradores" },
  { value: "rejected", label: "Rechazados" },
];

interface ArticlesToolbarProps {
  status: ArticleStatus | "";
  query: string;
  onStatusChange: (status: ArticleStatus | "") => void;
  onQueryChange: (query: string) => void;
}

/** Filtros por estado + búsqueda del listado de artículos admin. */
export function ArticlesToolbar({
  status,
  query,
  onStatusChange,
  onQueryChange,
}: ArticlesToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onStatusChange(f.value)}
            className={[
              "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition",
              status === f.value
                ? "bg-[#171717] text-white"
                : "border border-black/10 bg-white hover:bg-black/5",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
      </div>
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Buscar por título..."
        className="ml-auto min-h-10 w-full max-w-xs rounded-xl border border-[#deded5] bg-white px-4 text-sm outline-none focus:border-[#171717]"
      />
    </div>
  );
}
