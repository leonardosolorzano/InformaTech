import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header >
      <div>
        <div className="border-b border-black/10 bg-[#d8ff48] px-6 py-2 text-center text-[10px] font-bold uppercase tracking-[0.2em]">
          El futuro, contado con calma · Edición 04.10.26
        </div>
      </div>
      <nav
        className="flex justify-between items-center gap-8 text-sm font-bold uppercase traking-[0.14em]"
        aria-label="Navegacion principal"
      >
        <Link href="/">
          Info<span>/</span> Tech
        </Link>
        <div className="flex items-center gap-8 text-sm font-bold uppercase traking-[0.14em]">
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
            className="rounded-full bg-black px-4 py-2 text-white transition-transform hover:scale-105"
          >
            Newsletter <ArrowUpRight className="ml-1 inline size-3" />
          </Link>
        </div>
        <div>
          <Button>
            Login
          </Button>
          <Button>
            Register
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
