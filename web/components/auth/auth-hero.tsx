import { Newspaper } from "lucide-react";

/** Panel lateral izquierdo del login/registro (solo escritorio). */
export function AuthHero() {
  return (
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
          Análisis, historias y nuevas perspectivas para entender lo que está
          cambiando.
        </p>
      </div>

      <p className="text-xs font-medium text-white/45">
        InfoTech · Una lectura a la vez
      </p>
    </section>
  );
}
