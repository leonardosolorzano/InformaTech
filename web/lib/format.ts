const LOCALE = "es";

/**
 * Formatea una fecha ISO en español.
 * Devuelve "Recientemente" cuando no hay fecha (artículos sin publicar).
 */
export function formatDate(
  value: string | null | undefined,
  style: "long" | "short" = "long"
): string {
  if (!value) return "Recientemente";
  return new Date(value).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: style,
    year: "numeric",
  });
}
