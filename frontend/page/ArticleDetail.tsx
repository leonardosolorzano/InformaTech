import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchArticle, imageUrl } from "../src/api";
import type { Article } from "../src/types";

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    fetchArticle(Number(id))
      .then(setArticle)
      .catch((err) => {
        console.error(err);
        setError("No se pudo cargar el artículo.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) {
    return <p className="text-red-500">ID de artículo no válido.</p>;
  }

  if (loading) {
    return <p className="text-gray-400">Cargando artículo...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!article) {
    return <p className="text-gray-500">Artículo no encontrado.</p>;
  }

  const date = new Date(article.fecha_publication).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link to="/" className="text-primary hover:underline inline-block">
        ← Volver a artículos
      </Link>

      <article className="bg-white border border-border">
        {article.image_url && (
          <div className="w-full h-72 overflow-hidden border-b border-border">
            <img
              src={imageUrl(article.image_url)}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-8">
          <h1 className="text-3xl font-bold text-primary mb-4">{article.title}</h1>
          <div className="mb-6 text-sm text-gray-500 flex flex-wrap gap-4 pb-6 border-b border-border">
            <span>{article.author_name}</span>
            <span>{date}</span>
            <span>{article.minutes_to_read} min de lectura</span>
          </div>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{article.content}</p>
        </div>
      </article>
    </div>
  );
}
