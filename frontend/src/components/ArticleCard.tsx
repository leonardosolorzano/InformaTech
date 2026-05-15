import type { Article } from "../types";
import { Link } from "react-router-dom";
import { imageUrl } from "../api";

const CATEGORY_COLORS: Record<string, string> = {
  "Inteligencia Artificial": "bg-primary text-white",
  Ciberseguridad: "bg-primary text-white",
  "Cloud Computing": "bg-primary text-white",
  Blockchain: "bg-primary text-white",
  DevOps: "bg-primary text-white",
  "Desarrollo Web": "bg-primary text-white",
  "Data Science": "bg-primary text-white",
  IoT: "bg-primary text-white",
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

interface Props {
  article: Article;
}

export default function ArticleCard({ article }: Props) {
  const date = new Date(article.fecha_publication).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="bg-white border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {article.image_url && (
        <div className="w-full h-48 overflow-hidden border-b border-border">
          <img
            src={imageUrl(article.image_url)}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
            {article.author_image_url ? (
              <img src={imageUrl(article.author_image_url)} alt={article.author_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-gray-400">
                {article.author_name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-primary truncate">
              {article.author_name}
            </p>
          </div>
          {article.category && (
            <span
              className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 ${
                CATEGORY_COLORS[article.category] || "bg-muted text-gray-600"
              }`}
            >
              {article.category === "Inteligencia Artificial"
                ? "AI"
                : article.category === "Desarrollo Web"
                  ? "Web"
                  : article.category}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-primary mb-2 leading-snug">
          <Link to={`/articles/${article.id}`} className="hover:underline">
            {truncate(article.title, 60)}
          </Link>
        </h3>

        <p className="text-gray-500 text-sm mb-5 flex-1 leading-relaxed">
          {truncate(article.content, 60)}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-border">
          <span>{date}</span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {article.minutes_to_read} min
          </span>
        </div>
      </div>
    </article>
  );
}
