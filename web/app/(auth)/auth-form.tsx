"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, LockKeyhole, Newspaper } from "lucide-react";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
}

const inputClassName =
  "mt-2 min-h-12 w-full rounded-xl border border-[#deded5] bg-white px-4 text-sm text-[#171717] outline-none transition placeholder:text-[#92928a] focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/10";

function getErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const { detail, message } = data as { detail?: unknown; message?: unknown };
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail.flatMap((item: unknown) => {
      if (item && typeof item === "object" && "msg" in item) {
        const value = item.msg;
        return typeof value === "string" ? [value] : [];
      }
      return [];
    });
    if (messages.length > 0) return messages.join(" ");
  }
  return typeof message === "string" ? message : null;
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
        },
      );
      const data: unknown = await response.json();

      if (!response.ok) {
        setError(
          getErrorMessage(data) ??
            "No se pudo completar la solicitud. Revisa los datos e inténtalo de nuevo.",
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
    } catch {
      setError(
        "No se pudo conectar con el servidor. Verifica que la API esté disponible e inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-svh bg-[#f4f4ef] text-[#171717]">
      <div className="mx-auto flex min-h-svh max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-black uppercase tracking-tight"
            aria-label="InfoTech, ir al inicio"
          >
            Info<span className="text-[#8dad00]">/</span>Tech
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-[#5f5f58] transition hover:bg-black/5 hover:text-[#171717]"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Volver al inicio
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_0.9fr] lg:gap-20 lg:py-14">
          <section className="hidden min-h-[590px] flex-col justify-between overflow-hidden rounded-[2rem] bg-[#171717] p-10 text-white lg:flex xl:p-14">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-white/65">
              <span className="grid size-10 place-items-center rounded-full bg-[#d8ff48] text-[#171717]">
                <Newspaper aria-hidden="true" className="size-5" />
              </span>
              Información con perspectiva
            </div>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -right-8 -top-28 size-56 rounded-full border border-white/10"
              />
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#d8ff48]">
                Tecnología, sin ruido.
              </p>
              <h1 className="max-w-xl text-5xl font-black leading-[1.04] tracking-tight xl:text-6xl">
                Las ideas que mueven el mundo digital.
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-white/65">
                Análisis, historias y nuevas perspectivas para entender lo que
                está cambiando.
              </p>
            </div>
            <p className="text-xs font-medium text-white/45">
              InfoTech · Una lectura a la vez
            </p>
          </section>

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
                <div className="mt-7 rounded-2xl border border-[#b8d66a] bg-[#f5f9e9] p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-[#527000]"
                    />
                    <div>
                      <h3 className="font-bold">Cuenta creada correctamente</h3>
                      <p className="mt-1 text-sm leading-6 text-[#55594a]">
                        Ya puedes iniciar sesión con tu correo o nombre de
                        usuario.
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
              ) : (
                <form
                  ref={formRef}
                  className="mt-7 grid gap-5"
                  onSubmit={handleSubmit}
                  aria-busy={isSubmitting}
                >
                  {isRegister ? (
                    <>
                      <div>
                        <label
                          htmlFor="full_name"
                          className="text-sm font-semibold"
                        >
                          Nombre <span className="font-normal text-[#77776f]">(opcional)</span>
                        </label>
                        <input
                          id="full_name"
                          name="full_name"
                          type="text"
                          autoComplete="name"
                          maxLength={100}
                          placeholder="María García"
                          className={inputClassName}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="username"
                          className="text-sm font-semibold"
                        >
                          Nombre de usuario
                        </label>
                        <input
                          id="username"
                          name="username"
                          type="text"
                          autoComplete="username"
                          minLength={3}
                          maxLength={30}
                          pattern="[A-Za-z0-9_]+"
                          title="Usa de 3 a 30 letras, números o guiones bajos."
                          required
                          placeholder="maria_garcia"
                          className={inputClassName}
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label
                        htmlFor="identifier"
                        className="text-sm font-semibold"
                      >
                        Correo electrónico o usuario
                      </label>
                      <input
                        id="identifier"
                        name="identifier"
                        type="text"
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                        required
                        placeholder="tu@email.com o tu_usuario"
                        className={inputClassName}
                      />
                    </div>
                  )}

                  {isRegister && (
                    <div>
                      <label htmlFor="email" className="text-sm font-semibold">
                        Correo electrónico
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        required
                        placeholder="nombre@ejemplo.com"
                        className={inputClassName}
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="password" className="text-sm font-semibold">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={
                        isRegister ? "new-password" : "current-password"
                      }
                      minLength={isRegister ? 8 : undefined}
                      maxLength={128}
                      pattern={
                        isRegister ? "(?=.*[A-Za-z])(?=.*[0-9]).{8,128}" : undefined
                      }
                      title={
                        isRegister
                          ? "Debe tener al menos 8 caracteres, una letra y un número."
                          : undefined
                      }
                      required
                      placeholder={
                        isRegister ? "Mínimo 8 caracteres" : "Tu contraseña"
                      }
                      className={inputClassName}
                    />
                    {isRegister && (
                      <p className="mt-2 text-xs text-[#77776f]">
                        Usa al menos 8 caracteres, una letra y un número.
                      </p>
                    )}
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 text-sm font-bold text-white transition hover:bg-[#353535] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-65"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle
                          aria-hidden="true"
                          className="size-4 animate-spin"
                        />
                        {isRegister ? "Creando cuenta..." : "Iniciando sesión..."}
                      </>
                    ) : (
                      <>
                        {isRegister ? "Crear cuenta" : "Iniciar sesión"}
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {!registered && (
                <p className="mt-7 border-t border-black/[0.07] pt-6 text-center text-sm text-[#686860]">
                  {isRegister ? "¿Ya tienes cuenta?" : "¿Todavía no tienes cuenta?"}{" "}
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
