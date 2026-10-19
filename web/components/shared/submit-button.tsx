import type { ComponentType } from "react";
import { LoaderCircle } from "lucide-react";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition disabled:cursor-wait disabled:opacity-65";

const VARIANTS = {
  solid: "bg-[#171717] text-white hover:bg-[#353535]",
  outline: "border border-black/15 text-[#171717] hover:bg-black/5",
} as const;

const SIZES = {
  md: "min-h-12",
  sm: "min-h-11",
} as const;

interface SubmitButtonProps {
  loading: boolean;
  label: string;
  /** Etiqueta mientras carga. Por defecto se reutiliza `label`. */
  loadingLabel?: string;
  /** Si se pasa, se muestra el icono (y spinner al cargar). Sin icono, solo texto. */
  icon?: ComponentType<{ className?: string }>;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  className?: string;
}

/**
 * Botón de envío de formularios con estado de carga consistente.
 * Unifica los botones de auth, perfil, artículos y categorías.
 */
export function SubmitButton({
  loading,
  label,
  loadingLabel,
  icon: Icon,
  variant = "solid",
  size = "md",
  className,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={[BASE, VARIANTS[variant], SIZES[size], className]
        .filter(Boolean)
        .join(" ")}
    >
      {Icon &&
        (loading ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Icon aria-hidden="true" className="size-4" />
        ))}
      {loading ? loadingLabel ?? label : label}
    </button>
  );
}
