"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import { ArticleCoverField } from "./article-cover-field";
import { Field } from "@/components/shared/field";
import { FormMessage } from "@/components/shared/form-message";
import { SubmitButton } from "@/components/shared/submit-button";
import { ARTICLE_STATUS_OPTIONS } from "@/lib/constants";
import { toErrorMessage } from "@/lib/errors";
import { fetchJson } from "@/lib/http";
import { inputClassName } from "@/lib/styles";
import type { ArticleRead, ArticleStatus, CategoryRead } from "@/lib/types";

interface ArticleFormProps {
  article?: ArticleRead;
}

/** Formulario de creación/edición de artículos (vista admin). */
export default function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter();
  const isEdit = Boolean(article);

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

  useEffect(() => {
    let active = true;
    fetchJson<CategoryRead[]>("/api/admin/categories", { cache: "no-store" })
      .then((data) => {
        if (!active) return;
        setCategories(data);
        if (!isEdit && data.length > 0) {
          setCategoryId((prev) => (prev === "" ? data[0].id : prev));
        }
      })
      .catch(() => {
        // Sin categorías el formulario sigue siendo usable para editar.
      });
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
    try {
      const saved = await fetchJson<ArticleRead>(
        isEdit ? `/api/admin/articles/${article!.id}` : "/api/admin/articles",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            summary: summary.trim(),
            content: content.trim(),
            category_id: Number(categoryId),
            tags: tags
              .split(",")
              .map((t) => t.trim().toLowerCase())
              .filter(Boolean),
            status,
          }),
        }
      );
      router.push(`/admin/articles/${saved.id}/edit`);
      router.refresh();
    } catch (err) {
      setError(toErrorMessage(err, "No se pudo guardar"));
    } finally {
      setSaving(false);
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
          <Field htmlFor="title" label="Título">
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
          </Field>

          <Field htmlFor="summary" label="Resumen">
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
          </Field>

          <Field
            htmlFor="content"
            label="Contenido"
            hint="Mínimo 50 caracteres."
          >
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
          </Field>
        </div>

        <div className="space-y-5">
          <div className="space-y-5 rounded-2xl border border-black/10 bg-white p-6">
            <Field htmlFor="category" label="Categoría">
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
            </Field>

            <Field
              htmlFor="tags"
              label="Etiquetas"
              hint="Sepáralas por comas. Máximo 8."
            >
              <input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={inputClassName}
                placeholder="ia, apple, startups"
              />
            </Field>

            <Field htmlFor="status" label="Estado">
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                className={inputClassName}
              >
                {ARTICLE_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {isEdit && article ? (
            <ArticleCoverField
              articleId={article.id}
              coverUrl={coverUrl}
              onUploaded={(saved) => setCoverUrl(saved.cover_image_url ?? null)}
              onError={(message) => setError(message || null)}
            />
          ) : (
            <p className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-xs leading-5 text-[#77776f]">
              Guarda primero el artículo para poder añadir una imagen de portada.
            </p>
          )}

          {error && <FormMessage tone="error">{error}</FormMessage>}

          <SubmitButton
            loading={saving}
            label={isEdit ? "Guardar cambios" : "Publicar artículo"}
            loadingLabel="Guardando..."
            icon={Save}
            className="w-full"
          />
        </div>
      </form>
    </div>
  );
}
