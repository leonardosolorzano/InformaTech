import type { ReactNode } from "react";

type Tone = "success" | "error";

const TONES: Record<Tone, string> = {
  success: "border border-[#b8d66a] bg-[#f5f9e9] text-[#3f5200]",
  error: "border border-red-200 bg-red-50 text-red-800",
};

/**
 * Mensaje de resultado de formulario (éxito o error) con rol de accesibilidad.
 * Reutilizado por perfil, artículos, categorías y auth.
 */
export function FormMessage({
  tone,
  children,
}: {
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <p
      role={tone === "success" ? "status" : "alert"}
      className={`rounded-xl px-4 py-3 text-sm leading-5 ${TONES[tone]}`}
    >
      {children}
    </p>
  );
}
