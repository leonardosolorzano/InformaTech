"use client";

import Link from "next/link";
import { ShieldCheck, UserRound } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { NAV_LINKS } from "./nav-links";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

/** Cajón de navegación móvil: enlaces + acciones de sesión. */
export function MobileNav({ open, onClose }: MobileNavProps) {
  const { user, logout } = useAuth();

  return (
    <div
      className={[
        "overflow-hidden bg-[#f8f7f3] transition-all duration-300 ease-in-out md:hidden",
        open ? "max-h-96 border-b border-black/10" : "max-h-0",
      ].join(" ")}
    >
      <div className="flex flex-col gap-1 px-6 pb-6 pt-2 text-[12px] font-bold uppercase tracking-[0.14em]">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-3 transition-colors hover:bg-black/5"
            onClick={onClose}
          >
            {link.label}
          </Link>
        ))}

        <div className="mt-3 border-t border-black/10 pt-4">
          {user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1 pb-2">
                <UserRound className="size-4" />
                <span>{user.username}</span>
                <span className="rounded-full bg-[#d8ff48] px-2 py-0.5 text-[10px] font-bold uppercase">
                  {user.role}
                </span>
              </div>
              {user.role === "admin" && (
                <Link
                  href="/admin/users"
                  className="flex items-center justify-center gap-2 rounded-full border border-black/20 py-2.5 text-center transition-colors hover:bg-black/5"
                  onClick={onClose}
                >
                  <ShieldCheck className="size-4" />
                  Panel Admin
                </Link>
              )}
              <button
                onClick={() => {
                  onClose();
                  void logout();
                }}
                className="rounded-full bg-black py-2.5 text-center text-white transition-opacity hover:opacity-80"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                className="flex-1 rounded-full border border-black/20 py-2.5 text-center transition-colors hover:bg-black/5"
                onClick={onClose}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="flex-1 rounded-full bg-black py-2.5 text-center text-white transition-opacity hover:opacity-80"
                onClick={onClose}
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
