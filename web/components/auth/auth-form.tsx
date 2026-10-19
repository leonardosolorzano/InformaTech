"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole, Newspaper } from "lucide-react";

import { FormMessage } from "@/components/shared/form-message";
import { Logo } from "@/components/shared/logo";
import { SubmitButton } from "@/components/shared/submit-button";
import { ApiError, getApiErrorMessage } from "@/lib/errors";
import { AuthFields } from "./auth-fields";
import { AuthHero } from "./auth-hero";
import { AuthSuccess } from "./auth-success";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === "register";
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = isRegister
      ? {
          email: String(formData.get("email") ?? "").trim(),
          username: String(formData.get("username") ?? "").trim(),
          full_name: String(formData.get("full_name") ?? "").trim() || null,
          password: String(formData.get("password") ?? ""),
        }
      : {
          username: String(formData.get("identifier") ?? "").trim(),
          password: String(formData.get("password") ?? ""),
        };

    try {
      const response = await fetch(
        isRegister ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          getApiErrorMessage(data) ??
            "No se pudo completar la solicitud. Revisa los datos e inténtalo de nuevo."
        );
        return;
      }

      if (isRegister) {
        setRegistered(true);
        formRef.current?.reset();
      } else {
        const nextParam = new URLSearchParams(window.location.search).get("next");
        const destination = nextParam && nextParam.startsWith("/") ? nextParam : "/";
        router.replace(destination);
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo conectar con el servidor. Verifica que la API esté disponible e inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-svh bg-[#f4f4ef] text-[#171717]">
      <div className="mx-auto flex min-h-svh max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <Logo accent="green" />
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-[#5f5f58] transition hover:bg-black/5 hover:text-[#171717]"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Volver al inicio
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_0.9fr] lg:gap-20 lg:py-14">
          <AuthHero />

          <section className="mx-auto w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#73736a]">
                Tecnología, sin ruido.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-black/[0.06] bg-white p-6 shadow-[0_20px_70px_-40px_rgba(0,0,0,0.28)] sm:p-9">
              <div className="mb-7 flex size-12 items-center justify-center rounded-2xl bg-[#d8ff48]">
                {isRegister ? (
                  <Newspaper aria-hidden="true" className="size-5" />
                ) : (
                  <LockKeyhole aria-hidden="true" className="size-5" />
                )}
              </div>

              <h2 className="text-3xl font-black tracking-tight">
                {isRegister ? "Crea tu cuenta" : "Qué bueno verte"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#686860]">
                {isRegister
                  ? "Regístrate para seguir las historias que importan."
                  : "Inicia sesión para continuar en InfoTech."}
              </p>

              {registered ? (
                <AuthSuccess />
              ) : (
                <form
                  ref={formRef}
                  className="mt-7 grid gap-5"
                  onSubmit={handleSubmit}
                  aria-busy={isSubmitting}
                >
                  <AuthFields isRegister={isRegister} />

                  {error && <FormMessage tone="error">{error}</FormMessage>}

                  <SubmitButton
                    loading={isSubmitting}
                    label={isRegister ? "Crear cuenta" : "Iniciar sesión"}
                    loadingLabel={
                      isRegister ? "Creando cuenta..." : "Iniciando sesión..."
                    }
                    icon={ArrowRight}
                    className="mt-1"
                  />
                </form>
              )}

              {!registered && (
                <p className="mt-7 border-t border-black/[0.07] pt-6 text-center text-sm text-[#686860]">
                  {isRegister
                    ? "¿Ya tienes cuenta?"
                    : "¿Todavía no tienes cuenta?"}{" "}
                  <Link
                    href={isRegister ? "/login" : "/register"}
                    className="font-bold text-[#171717] underline decoration-[#b7d34b] decoration-2 underline-offset-4 hover:text-[#5d7100]"
                  >
                    {isRegister ? "Inicia sesión" : "Regístrate"}
                  </Link>
                </p>
              )}
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-[#77776f]">
              Al continuar, tus datos se envían de forma segura a InfoTech.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
