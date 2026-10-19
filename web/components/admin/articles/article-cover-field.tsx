"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, LoaderCircle } from "lucide-react";

import { toErrorMessage } from "@/lib/errors";
import { getImageUrl } from "@/lib/api";
import { fetchJson } from "@/lib/http";
import type { ArticleRead } from "@/lib/types";

interface ArticleCoverFieldProps {
  articleId: number;
  coverUrl: string | null;
  onUploaded: (article: ArticleRead) => void;
  onError: (message: string) => void;
}

/** Subida de imagen de portada (solo disponible para artículos guardados). */
export function ArticleCoverField({
  articleId,
  coverUrl,
  onUploaded,
  onError,
}: ArticleCoverFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    onError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const saved = await fetchJson<ArticleRead>(
        `/api/admin/articles/${articleId}/cover`,
        { method: "POST", body: formData }
      );
      onUploaded(saved);
    } catch (err) {
      onError(toErrorMessage(err, "Error subiendo portada"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
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
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-black/15 text-sm font-semibold transition hover:bg-black/5 disabled:opacity-60"
      >
        {uploading ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <ImagePlus className="size-4" />
        )}
        {uploading ? "Subiendo..." : "Subir portada"}
      </button>
    </div>
  );
}
