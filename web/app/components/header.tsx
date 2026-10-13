"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="border-b border-black/10 bg-[#d8ff48] px-6 py-2 text-center text-[10px] font-bold uppercase tracking-[0.2em]">
        El futuro, contado con calma · Edición 04.10.26
      </div>

      {/* Main nav */}
      <nav
        aria-label="Navegación principal"
        className={[
          "flex items-center justify-between gap-6 px-6 py-4 transition-all duration-300 md:px-10 lg:px-16",
          scrolled
            ? "bg-[#f8f7f3]/90 shadow-sm backdrop-blur-md"
            : "bg-[#f8f7f3]",
        ].join(" ")}
      >
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 text-lg font-black uppercase tracking-tight transition-opacity hover:opacity-70"
        >
          Info<span className="text-[#d8ff48] [-webkit-text-stroke:1px_black]">/</span>Tech
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-7 text-[11px] font-bold uppercase tracking-[0.14em] md:flex">
          <Link
            href="#historias"
            className="transition-colors hover:text-[#8a8a82]"
          >
            Historias
          </Link>
          <Link
            href="#tendencias"
            className="transition-colors hover:text-[#8a8a82]"
          >
            Tendencias
          </Link>
          <Link
            href="#opinion"
            className="transition-colors hover:text-[#8a8a82]"
          >
            Opinión
          </Link>
          <Link
            href="#newsletter"
            className="inline-flex items-center gap-1 rounded-full bg-black px-4 py-2 text-white transition-all hover:bg-black/80 hover:scale-105 active:scale-95"
          >
            Newsletter <ArrowUpRight className="size-3" />
          </Link>
        </div>

        {/* Auth buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-black/5"
            asChild
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-black px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-black/80 hover:scale-105 active:scale-95"
            asChild
          >
            <Link href="/register">Registrarse</Link>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="ml-auto flex items-center justify-center rounded-full p-2 transition-colors hover:bg-black/5 md:hidden"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={[
          "overflow-hidden bg-[#f8f7f3] transition-all duration-300 ease-in-out md:hidden",
          menuOpen ? "max-h-96 border-b border-black/10" : "max-h-0",
        ].join(" ")}
      >
        <div className="flex flex-col gap-1 px-6 pb-6 pt-2 text-[12px] font-bold uppercase tracking-[0.14em]">
          <Link
            href="#historias"
            className="rounded-lg px-3 py-3 transition-colors hover:bg-black/5"
            onClick={() => setMenuOpen(false)}
          >
            Historias
          </Link>
          <Link
            href="#tendencias"
            className="rounded-lg px-3 py-3 transition-colors hover:bg-black/5"
            onClick={() => setMenuOpen(false)}
          >
            Tendencias
          </Link>
          <Link
            href="#opinion"
            className="rounded-lg px-3 py-3 transition-colors hover:bg-black/5"
            onClick={() => setMenuOpen(false)}
          >
            Opinión
          </Link>
          <Link
            href="#newsletter"
            className="mt-1 rounded-lg px-3 py-3 transition-colors hover:bg-black/5"
            onClick={() => setMenuOpen(false)}
          >
            Newsletter
          </Link>
          <div className="mt-3 flex gap-2 border-t border-black/10 pt-4">
            <Link
              href="/login"
              className="flex-1 rounded-full border border-black/20 py-2.5 text-center transition-colors hover:bg-black/5"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="flex-1 rounded-full bg-black py-2.5 text-center text-white transition-opacity hover:opacity-80"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
