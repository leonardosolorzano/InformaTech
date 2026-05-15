import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchArticles, deleteArticle } from "../src/api";
import { useAuth } from "../src/context/AuthContext";
import type { Article } from "../src/types";

export default function Dashboard() {
  const { user, token } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Article | null>(null);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const all = await fetchArticles(token);
      setArticles(all.filter((a) => a.user_id === user?.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token, user?.id]);

  async function confirmDelete() {
    if (!deleting || !token) return;
    try {
      await deleteArticle(deleting.id, token);
      setArticles((prev) => prev.filter((a) => a.id !== deleting.id));
      setDeleting(null);
    } catch (err) {
      console.error(err);
    }
  }

  const myArticles = articles;
  const totalReadTime = myArticles.reduce((sum, a) => sum + a.minutes_to_read, 0);

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">Inicia sesión para acceder al dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Bienvenido, {user.full_name}</p>
        </div>
        <Link
          to="/dashboard/new"
          className="px-5 py-2.5 bg-primary text-white font-semibold hover:bg-primary-light transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Artículo
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-border p-5">
          <p className="text-sm text-gray-400 font-medium">Total Artículos</p>
          <p className="text-3xl font-bold text-primary mt-1">{myArticles.length}</p>
        </div>
        <div className="bg-white border border-border p-5">
          <p className="text-sm text-gray-400 font-medium">Tiempo Total Lectura</p>
          <p className="text-3xl font-bold text-primary mt-1">{totalReadTime} min</p>
        </div>
        <div className="bg-white border border-border p-5">
          <p className="text-sm text-gray-400 font-medium">Promedio Lectura</p>
          <p className="text-3xl font-bold text-primary mt-1">
            {myArticles.length > 0 ? Math.round(totalReadTime / myArticles.length) : 0} min
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-10">Cargando artículos...</p>
      ) : myArticles.length === 0 ? (
        <div className="bg-white border border-border p-12 text-center">
          <p className="text-gray-400 text-lg mb-2">No tienes artículos aún</p>
          <p className="text-gray-400 text-sm mb-6">Crea tu primer artículo para empezar.</p>
          <Link
            to="/dashboard/new"
            className="px-5 py-2.5 bg-primary text-white font-semibold hover:bg-primary-light transition inline-block"
          >
            Crear Artículo
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Título</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 hidden sm:table-cell">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-500 hidden md:table-cell">Lectura</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {myArticles.map((article) => (
                  <tr key={article.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="py-3 px-4">
                      <Link
                        to={`/articles/${article.id}`}
                        className="font-medium text-primary truncate max-w-xs hover:underline block"
                      >
                        {article.title.length > 50 ? article.title.slice(0, 50) + "..." : article.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-400 hidden sm:table-cell">
                      {new Date(article.fecha_publication).toLocaleDateString("es-ES")}
                    </td>
                    <td className="py-3 px-4 text-gray-400 hidden md:table-cell">
                      {article.minutes_to_read} min
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/dashboard/edit/${article.id}`}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-muted transition"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setDeleting(article)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleting(null)}>
          <div className="bg-white shadow-2xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-primary mb-2">Eliminar Artículo</h2>
            <p className="text-sm text-gray-500 mb-6">
              ¿Estás seguro de que deseas eliminar "{deleting.title.length > 50 ? deleting.title.slice(0, 50) + "..." : deleting.title}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 border border-border text-gray-600 hover:bg-muted transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
