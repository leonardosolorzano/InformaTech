import { ARTICLE_STATUS_LABELS, ARTICLE_STATUS_STYLES } from "@/lib/constants";
import type { ArticleStatus } from "@/lib/types";

/** Badge con el estado del artículo (color + etiqueta). */
export function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${ARTICLE_STATUS_STYLES[status]}`}
    >
      {ARTICLE_STATUS_LABELS[status]}
    </span>
  );
}
