"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, LoaderCircle, Save } from "lucide-react";
import type { ArticleRead, ArticleStatus, CategoryRead } from "@/lib/types";
import { getImageUrl } from "@/lib/api";
import { toast } from "sonner";

const inputClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[#deded5] bg-white px-4 text-sm text-[#171717] outline-none transition placeholder:text-[#92928a] focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/10";

const STATUS_OPTIONS: { value: ArticleStatus; label: string }[] = [
  { value: "draft", label: "Borrador" },
  { value: "pending", label: "En revisión" },
  { value: "published", label: "Publicado" },
  { value: "rejected", label: "Rechazado" },
];

interface ArticleFormProps {
  article?: ArticleRead;
}

export default function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter();
  const isEdit = Boolean(article);
  const fileRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<CategoryRead[]>([]);
  const [title, setTitle] = useState(article?.title ?? "");
  const [summary, setSummary] = useState(article?.summary ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [categoryId, setCategoryId] = useState<number | "">(
    article?.category.id ?? ""
  );
  const [tags, setTags] = useState(
    article?.tags.map((t) => t.name).join(", ") ?? ""
  );
  const [status, setStatus] = useState<ArticleStatus>(
    article?.status ?? "published"
  );
  const [coverUrl, setCoverUrl] = useState<string | null>(
    article?.cover_image_url ?? null
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/admin/categories", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as CategoryRead[];
        if (active) {
          setCategories(data);
          if (!isEdit && data.length > 0) {
            setCategoryId((prev) => (prev === "" ? data[0].id : prev));
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, [isEdit]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (categoryId === "") {
      setError("Selecciona una categoría.");
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      category_id: Number(categoryId),
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      status,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/articles/${article!.id}` : "/api/admin/articles",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = Array.isArray(data.detail)
          ? data.detail.map((d: { msg?: string }) => d.msg).join(". ")
          : data.detail;
        throw new Error(detail || `Error ${res.status}`);
      }
      const saved = (await res.json()) as ArticleRead;
      toast.success(isEdit ? "Artículo actualizado correctamente" : "Artículo creado correctamente");
      router.push("/admin/articles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
      toast.error(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !article) return;
    setUploadingCover(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/admin/articles/${article.id}/cover`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "No se pudo subir la portada");
      }
      const saved = (await res.json()) as ArticleRead;
      setCoverUrl(saved.cover_image_url ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo portada");
    } finally {
      setUploadingCover(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#5f5f58] hover:text-[#171717]"
      >
        <ArrowLeft className="size-4" />
        Volver a artículos
      </Link>

      <header>
        <h1 className="text-3xl font-black tracking-tight">
          {isEdit ? "Editar artículo" : "Nueva publicación"}
        </h1>
        <p className="mt-1 text-sm text-[#686860]">
          {isEdit
            ? "Modifica el contenido y su estado de publicación."
            : "Redacta y publica contenido directamente como administrador."}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5 rounded-2xl border border-black/10 bg-white p-6">
          <div>
            <label htmlFor="title" className="text-sm font-semibold">
              Título
            </label>
            <input
              id="title"
              required
              minLength={5}
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClassName}
              placeholder="Un titular claro y atractivo"
            />
          </div>

          <div>
            <label htmlFor="summary" className="text-sm font-semibold">
              Resumen
            </label>
            <textarea
              id="summary"
              required
              minLength={10}
              maxLength={500}
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className={inputClassName}
              placeholder="Breve descripción para las tarjetas y resultados"
            />
          </div>

          <div>
            <label htmlFor="content" className="text-sm font-semibold">
              Contenido
            </label>
            <textarea
              id="content"
              required
              minLength={50}
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`${inputClassName} font-mono leading-6`}
              placeholder="Escribe el cuerpo del artículo..."
            />
            <p className="mt-2 text-xs text-[#77776f]">
              Mínimo 50 caracteres.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-5 rounded-2xl border border-black/10 bg-white p-6">
            <div>
              <label htmlFor="category" className="text-sm font-semibold">
                Categoría
              </label>
              <select
                id="category"
                required
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(e.target.value ? Number(e.target.value) : "")
                }
                className={inputClassName}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="text-sm font-semibold">
                Etiquetas
              </label>
              <input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={inputClassName}
                placeholder="ia, apple, startups"
              />
              <p className="mt-2 text-xs text-[#77776f]">
                Sepáralas por comas. Máximo 8.
              </p>
            </div>

            <div>
              <label htmlFor="status" className="text-sm font-semibold">
                Estado
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                className={inputClassName}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isEdit && (
            <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-6">
              <p className="text-sm font-semibold">Imagen de portada</p>
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getImageUrl(coverUrl) ?? coverUrl}
                  alt="Portada del artículo"
                  className="h-40 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="grid h-40 place-items-center rounded-xl border border-dashed border-black/15 text-xs text-[#77776f]">
                  Sin portada
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingCover}
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-black/15 text-sm font-semibold transition hover:bg-black/5 disabled:opacity-60"
              >
                {uploadingCover ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <ImagePlus className="size-4" />
                )}
                {uploadingCover ? "Subiendo..." : "Subir portada"}
              </button>
            </div>
          )}

          {!isEdit && (
            <p className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-xs leading-5 text-[#77776f]">
              Guarda primero el artículo para poder añadir una imagen de portada.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 text-sm font-bold text-white transition hover:bg-[#353535] disabled:cursor-wait disabled:opacity-65"
          >
            {saving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Publicar artículo"}
          </button>
        </div>
      </form>
    </div>
  );
}
