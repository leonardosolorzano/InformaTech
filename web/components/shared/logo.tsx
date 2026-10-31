import Link from "next/link";

const ACCENTS = {
  lime: "text-[#d8ff48] [-webkit-text-stroke:1px_black]",
  green: "text-[#8dad00]",
} as const;

interface LogoProps {
  accent?: keyof typeof ACCENTS;
  className?: string;
  href?: string;
}

/** Logotipo "Info/Tech" compartido por header, auth y panel admin. */
export function Logo({ accent = "lime", className, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="InfoTech, ir al inicio"
      className={[
        "text-lg font-black uppercase tracking-tight",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      Info<span className={ACCENTS[accent]}>/</span>Tech
    </Link>
  );
}
