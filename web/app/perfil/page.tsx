"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { PasswordForm } from "@/components/profile/password-form";
import { ProfileForm } from "@/components/profile/profile-form";
import { useAuth } from "@/components/providers/auth-provider";

export default function PerfilPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login?next=/perfil");
    }
  }, [isLoading, user, router]);

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

          <ProfileForm user={user} />
          <PasswordForm />
        </div>
      </div>
    </main>
  );
}
