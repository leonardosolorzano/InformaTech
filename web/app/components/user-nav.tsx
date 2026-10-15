"use client";

import Link from "next/link";
import {
  ChevronDown,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "./auth-provider";

export function UserNav() {
  const { user, isLoading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="h-8 w-24 animate-pulse rounded-full bg-black/5" />
    );
  }

  if (!user) {
    return (
      <div className="hidden items-center gap-2 md:flex">
        <Link
          href="/login"
          className="inline-flex h-8 items-center justify-center rounded-full px-3 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors hover:bg-black/5"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="inline-flex h-8 items-center justify-center rounded-full bg-black px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:scale-105 hover:bg-black/80 active:scale-95"
        >
          Registrarse
        </Link>
      </div>
    );
  }

  return (
    <div className="relative hidden md:block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors hover:bg-black/5"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserRound className="size-4" />
        <span>{user.username}</span>
        <ChevronDown className="size-3" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg">
          <div className="border-b border-black/5 px-4 py-3">
            <p className="text-sm font-semibold">{user.full_name || user.username}</p>
            <p className="text-xs text-[#686860]">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-[#d8ff48] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]">
              {user.role}
            </span>
          </div>
          <div className="flex flex-col py-1">
            <Link
              href="/perfil"
              className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-black/5"
              onClick={() => setOpen(false)}
            >
              <UserRound className="size-4" />
              Mi perfil
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin/users"
                className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-black/5"
                onClick={() => setOpen(false)}
              >
                <ShieldCheck className="size-4" />
                Panel Admin
              </Link>
            )}
            <button
              onClick={() => {
                setOpen(false);
                void logout();
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
