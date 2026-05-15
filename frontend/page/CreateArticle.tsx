import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createArticle, uploadArticleImage, imageUrl } from "../src/api";
import { useAuth } from "../src/context/AuthContext";
import { CATEGORIES } from "../src/types";
import type { ArticleFormData } from "../src/types";

export default function CreateArticle() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ArticleFormData>({
    title: "",
    content: "",
    minutes_to_read: 5,
    fecha_publication: new Date().toISOString().split("T")[0],
    category: "",
    image_url: null,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function handleImageSelect(file: File) {
    if (!token) return;
    if (!file.type.startsWith("image/")) {
      setFormError("El archivo debe ser una imagen.");
      return;
    }
    setUploading(true);
    setFormError("");
    try {
      const result = await uploadArticleImage(file, token);
      setForm((prev) => ({ ...prev, image_url: result.image_url }));
      setImagePreview(URL.createObjectURL(file));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveImage() {
    setForm((prev) => ({ ...prev, image_url: null }));
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setFormError("");
    try {
      await createArticle(form, token);
      navigate("/dashboard");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">Inicia sesión para crear artículos.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Nuevo Artículo</h1>
        <p className="text-sm text-gray-500 mt-1">Crea un nuevo artículo para tu blog</p>
      </div>

      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 mb-6 text-sm">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-border p-6">
          <label className="block text-sm font-medium text-primary mb-2">Título</label>
          <input
            type="text"
            required
            minLength={10}
            maxLength={150}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 border border-border bg-white text-primary outline-none focus:border-primary transition text-lg"
            placeholder="Título del artículo (10-150 caracteres)"
          />
        </div>

        <div className="bg-white border border-border p-6">
          <label className="block text-sm font-medium text-primary mb-2">Imagen del artículo</label>
          <div className="flex items-center gap-4">
            {imagePreview || form.image_url ? (
              <div className="relative w-full max-w-md">
                <img
                  src={imagePreview || imageUrl(form.image_url!)}
                  alt="Preview"
                  className="w-full h-48 object-cover border border-border"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-primary text-white w-8 h-8 flex items-center justify-center hover:bg-primary-light"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="w-full max-w-md h-48 border border-border bg-muted flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition"
              >
                <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-400">
                  {uploading ? "Subiendo imagen..." : "Haz clic para agregar imagen"}
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageSelect(file);
            }}
          />
        </div>

        <div className="bg-white border border-border p-6">
          <label className="block text-sm font-medium text-primary mb-2">Contenido</label>
          <textarea
            required
            minLength={50}
            maxLength={10000}
            rows={16}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full px-4 py-3 border border-border bg-white text-primary outline-none focus:border-primary transition resize-y"
            placeholder="Contenido del artículo (mínimo 50 caracteres)"
          />
          <p className="text-xs text-gray-400 mt-2">{form.content.length} / 10000 caracteres</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-border p-6">
            <label className="block text-sm font-medium text-primary mb-2">Minutos de lectura</label>
            <input
              type="number"
              required
              min={1}
              max={999}
              value={form.minutes_to_read}
              onChange={(e) => setForm({ ...form, minutes_to_read: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-border bg-white text-primary outline-none focus:border-primary transition"
            />
          </div>

          <div className="bg-white border border-border p-6">
            <label className="block text-sm font-medium text-primary mb-2">Fecha de publicación</label>
            <input
              type="date"
              required
              value={form.fecha_publication}
              onChange={(e) => setForm({ ...form, fecha_publication: e.target.value })}
              className="w-full px-4 py-3 border border-border bg-white text-primary outline-none focus:border-primary transition"
            />
          </div>

          <div className="bg-white border border-border p-6">
            <label className="block text-sm font-medium text-primary mb-2">Categoría</label>
            <select
              value={form.category || ""}
              onChange={(e) => setForm({ ...form, category: e.target.value || null })}
              className="w-full px-4 py-3 border border-border bg-white text-primary outline-none focus:border-primary transition"
            >
              <option value="">Sin categoría</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 border border-border text-primary hover:bg-muted transition font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-6 py-3 bg-primary text-white font-semibold hover:bg-primary-light transition disabled:opacity-50"
          >
            {saving ? "Publicando..." : "Publicar Artículo"}
          </button>
        </div>
      </form>
    </div>
  );
}
