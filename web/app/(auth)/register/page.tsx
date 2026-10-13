"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

const inputClass =
  "h-full min-h-[44px] w-full rounded-lg border border-black/15 bg-transparent px-4 py-3 text-sm font-medium text-[#171717] placeholder:text-[#8a8a82] focus:border-black/40 focus:outline-none transition-colors";

const labelClass = "block mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#696963]";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f3] text-[#171717]">
      {/* Back link */}
      <div className="px-6 pt-8 md:px-10 lg:px-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#696963] transition-colors hover:text-[#171717]"
        >
          <ArrowLeft className="size-3.5" />
          Volver al sitio
        </Link>
      </div>

      {/* Form container */}
      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center px-6 py-12">
        {/* Brand */}
        <Link
          href="/"
          className="mb-10 text-base font-black uppercase tracking-tight"
        >
          Info<span className="text-[#d8ff48] [-webkit-text-stroke:1px_black]">/</span>Tech
        </Link>

        <h1 className="text-[28px] font-black leading-tight tracking-tight">
          Crear cuenta
        </h1>
        <p className="mb-8 mt-2 text-sm text-[#696963]">
          Únete y empieza a seguir las historias que importan.
        </p>

        {/* Google */}
        <form className="mb-5">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-black/15 bg-white px-4 py-3 text-sm font-semibold text-[#171717] transition-all hover:bg-black/5 active:scale-[.98]"
          >
            <GoogleIcon />
            Continuar con Google
          </button>
        </form>

        {/* Divider */}
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-black/10" />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a8a82]">o</span>
          <div className="h-px flex-1 bg-black/10" />
        </div>

        {/* Register form */}
        <form className="grid gap-4">
          {/* Full name + Username side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="full_name" className={labelClass}>
                Nombre
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="María García"
                autoComplete="name"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="username" className={labelClass}>
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="mariagg"
                autoComplete="username"
                className={inputClass}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={labelClass}>
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className={labelClass}>
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirm_password" className={labelClass}>
              Confirmar contraseña
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          {/* Terms */}
          <p className="text-[11px] leading-relaxed text-[#8a8a82]">
            Al registrarte aceptas nuestros{" "}
            <Link href="/terminos" className="font-bold text-[#171717] underline underline-offset-2">
              Términos de uso
            </Link>{" "}
            y{" "}
            <Link href="/privacidad" className="font-bold text-[#171717] underline underline-offset-2">
              Política de privacidad
            </Link>
            .
          </p>

          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-black/80 hover:scale-[1.02] active:scale-[.98]"
          >
            Crear cuenta <ArrowUpRight className="size-4" />
          </button>
        </form>

        {/* Footer link */}
        <p className="mt-6 text-center text-[12px] text-[#696963]">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-bold text-[#171717] underline underline-offset-2 transition-opacity hover:opacity-60"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-4 shrink-0" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a11.966 11.966 0 0 1-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}
