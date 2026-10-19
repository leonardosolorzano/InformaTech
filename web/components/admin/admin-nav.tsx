"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderTree,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Users,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/articles", label: "Artículos", icon: Newspaper, exact: false },
  { href: "/admin/categories", label: "Categorías", icon: FolderTree, exact: false },
  { href: "/admin/users", label: "Usuarios", icon: Users, exact: false },
];

interface AdminNavProps {
  username: string;
  fullName: string | null;
  role: string;
}

/** Navegación lateral del panel de administración. */
export default function AdminNav({ username, fullName, role }: AdminNavProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <nav className="flex flex-col gap-1" aria-label="Navegación de administración">
      <div className="mb-3 rounded-2xl border border-black/10 bg-white p-4">
        <p className="text-sm font-bold">{fullName || username}</p>
        <p className="text-xs text-[#686860]">@{username}</p>
        <span className="mt-2 inline-block rounded-full bg-[#d8ff48] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]">
          {role}
        </span>
      </div>

      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={[
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
              active
                ? "bg-[#171717] text-white"
                : "text-[#3f3f38] hover:bg-black/5",
            ].join(" ")}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}

      <div className="mt-3 border-t border-black/10 pt-3">
        <Link
          href="/"
          className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#3f3f38] transition-colors hover:bg-black/5"
        >
          Volver al sitio
        </Link>
        <button
          onClick={() => void logout()}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
