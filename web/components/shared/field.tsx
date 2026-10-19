import type { ReactNode } from "react";

/**
 * Campo de formulario con label y pista opcional.
 * Unifica el marcado y los estilos de label/hint en todos los formularios.
 */
interface FieldProps {
  htmlFor: string;
  label: ReactNode;
  hint?: ReactNode;
  /** Control: `<input>`, `<textarea>` o `<select>`. */
  children: ReactNode;
}

export function Field({ htmlFor, label, hint, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className="mt-2 text-xs text-[#77776f]">{hint}</p>}
    </div>
  );
}
