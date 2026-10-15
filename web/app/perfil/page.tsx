"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../components/auth-provider";

const inputClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[#deded5] bg-white px-4 text-sm text-[#171717] outline-none transition placeholder:text-[#92928a] focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/10";

export default function PerfilPage() {
  const { user, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passMsg, setPassMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login?next=/perfil");
    }
  }, [isLoading, user, router]);

  function applyUserFields(u: { full_name: string | null; bio: string | null }) {
    setFullName(u.full_name ?? "");
    setBio(u.bio ?? "");
  }

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!active || !res.ok) return;
        const data = (await res.json()) as { full_name: string | null; bio: string | null };
        setFullName(data.full_name ?? "");
        setBio(data.bio ?? "");
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName || null, bio: bio || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "No se pudo guardar");
      }
      const updated = (await res.json()) as { full_name: string | null; bio: string | null };
      applyUserFields(updated);
      setProfileMsg({ ok: true, text: "Perfil actualizado correctamente" });
      await refreshUser();
    } catch (err) {
      setProfileMsg({
        ok: false,
        text: err instanceof Error ? err.message : "Error al guardar",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPassword(true);
    setPassMsg(null);
    try {
      const res = await fetch("/api/users/me/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.detail || "No se pudo cambiar la contraseña"
        );
      }
      setPassMsg({ ok: true, text: "Contraseña actualizada correctamente" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPassMsg({
        ok: false,
        text: err instanceof Error ? err.message : "Error al cambiar",
      });
    } finally {
      setSavingPassword(false);
    }
  }

  if (isLoading || !user) {
    return (
      <main className="grid min-h-svh place-items-center bg-[#f4f4ef]">
        <p className="text-sm text-[#686860]">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-[#f4f4ef] text-[#171717]">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5f5f58] hover:text-[#171717]"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Link>

        <div className="mt-6 rounded-[1.75rem] border border-black/[0.06] bg-white p-6 sm:p-9">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight">Mi perfil</h1>
            <span className="rounded-full bg-[#d8ff48] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]">
              {user.role}
            </span>
          </div>
          <p className="mt-2 text-sm text-[#686860]">
            {user.email} · @{user.username}
          </p>
          {user.role === "admin" && (
            <Link
              href="/admin/users"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-semibold hover:bg-black/5"
            >
              <ShieldCheck className="size-4" />
              Ir al panel de administración
            </Link>
          )}

          <form className="mt-8 grid gap-5" onSubmit={saveProfile}>
            <h2 className="text-lg font-bold">Datos públicos</h2>
            <div>
              <label htmlFor="full_name" className="text-sm font-semibold">
                Nombre
              </label>
              <input
                id="full_name"
                type="text"
                maxLength={100}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClassName}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label htmlFor="bio" className="text-sm font-semibold">
                Biografía
              </label>
              <textarea
                id="bio"
                maxLength={1000}
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={inputClassName}
                placeholder="Cuéntanos algo sobre ti"
              />
            </div>
            {profileMsg && (
              <p
                role="status"
                className={`rounded-xl px-4 py-3 text-sm ${
                  profileMsg.ok
                    ? "border border-[#b8d66a] bg-[#f5f9e9] text-[#3f5200]"
                    : "border border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {profileMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-[#171717] px-5 text-sm font-bold text-white transition hover:bg-[#353535] disabled:cursor-wait disabled:opacity-65"
            >
              {savingProfile ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Guardar cambios
                </>
              )}
            </button>
          </form>

          <form
            className="mt-10 grid gap-5 border-t border-black/[0.07] pt-8"
            onSubmit={changePassword}
          >
            <h2 className="text-lg font-bold">Cambiar contraseña</h2>
            <div>
              <label htmlFor="current_password" className="text-sm font-semibold">
                Contraseña actual
              </label>
              <input
                id="current_password"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="new_password" className="text-sm font-semibold">
                Nueva contraseña
              </label>
              <input
                id="new_password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,128}"
                title="Debe tener al menos 8 caracteres, una letra y un número."
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClassName}
              />
              <p className="mt-2 text-xs text-[#77776f]">
                Usa al menos 8 caracteres, una letra y un número.
              </p>
            </div>
            {passMsg && (
              <p
                role="status"
                className={`rounded-xl px-4 py-3 text-sm ${
                  passMsg.ok
                    ? "border border-[#b8d66a] bg-[#f5f9e9] text-[#3f5200]"
                    : "border border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {passMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-black/15 px-5 text-sm font-bold transition hover:bg-black/5 disabled:cursor-wait disabled:opacity-65"
            >
              {savingPassword ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
