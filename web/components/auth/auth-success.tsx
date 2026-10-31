import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

/** Confirmación mostrada tras registrarse correctamente. */
export function AuthSuccess() {
  return (
    <div className="mt-7 rounded-2xl border border-[#b8d66a] bg-[#f5f9e9] p-5">
      <div className="flex items-start gap-3">
        <CheckCircle2
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-[#527000]"
        />
        <div>
          <h3 className="font-bold">Cuenta creada correctamente</h3>
          <p className="mt-1 text-sm leading-6 text-[#55594a]">
            Ya puedes iniciar sesión con tu correo o nombre de usuario.
          </p>
        </div>
      </div>
      <Link
        href="/login"
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-4 text-sm font-bold text-white transition hover:bg-[#353535] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717] focus-visible:ring-offset-2"
      >
        Ir a iniciar sesión
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </div>
  );
}
