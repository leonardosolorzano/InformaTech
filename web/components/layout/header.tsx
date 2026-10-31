"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { useScrolled } from "@/hooks/use-scrolled";
import { MobileNav } from "./mobile-nav";
import { NAV_LINKS } from "./nav-links";
import { UserNav } from "./user-nav";

export function Header() {
  const scrolled = useScrolled(12);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Barra de anuncio */}
      <div className="border-b border-black/10 bg-[#d8ff48] px-6 py-2 text-center text-[10px] font-bold uppercase tracking-[0.2em]">
        El futuro, contado con calma · Edición 04.10.26
      </div>

      {/* Nav principal */}
      <nav
        aria-label="Navegación principal"
        className={[
          "flex items-center justify-between gap-6 px-6 py-4 transition-all duration-300 md:px-10 lg:px-16",
          scrolled
            ? "bg-[#f8f7f3]/90 shadow-sm backdrop-blur-md"
            : "bg-[#f8f7f3]",
        ].join(" ")}
      >
        <Logo className="shrink-0 transition-opacity hover:opacity-70" />

        {/* Enlaces escritorio */}
        <div className="hidden items-center gap-7 text-[11px] font-bold uppercase tracking-[0.14em] md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.highlight
                  ? "inline-flex items-center gap-1 rounded-full bg-black px-4 py-2 text-white transition-all hover:scale-105 hover:bg-black/80 active:scale-95"
                  : "transition-colors hover:text-[#8a8a82]"
              }
            >
              {link.label}
              {link.highlight && <ArrowUpRight className="size-3" />}
            </Link>
          ))}
        </div>

        <UserNav />

        {/* Toggle menú móvil */}
        <button
          className="ml-auto flex items-center justify-center rounded-full p-2 transition-colors hover:bg-black/5 md:hidden"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Cajón móvil */}
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

export default Header;
