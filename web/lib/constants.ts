import type { ArticleStatus, UserRole } from "./types";

/** Etiquetas en español para los estados de un artículo. */
export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "Borrador",
  pending: "En revisión",
  published: "Publicado",
  rejected: "Rechazado",
};

/** Estilos Tailwind para el badge de cada estado de artículo. */
export const ARTICLE_STATUS_STYLES: Record<ArticleStatus, string> = {
  draft: "bg-black/10 text-[#3f3f38]",
  pending: "bg-[#ffe08a] text-[#6b5300]",
  published: "bg-[#d8ff48] text-[#3f5200]",
  rejected: "bg-[#ffd0d0] text-[#8a1f1f]",
};

/** Opciones para `<select>` de estado de artículo. */
export const ARTICLE_STATUS_OPTIONS: { value: ArticleStatus; label: string }[] =
  (
    Object.entries(ARTICLE_STATUS_LABELS) as [ArticleStatus, string][]
  ).map(([value, label]) => ({ value, label }));

/** Roles de usuario soportados por el backend. */
export const USER_ROLES: UserRole[] = ["user", "editor", "admin"];
