import { ArrowRight } from "lucide-react";

const FeaturedMain = () => {
    return (
        <section className="max-w-7xl m-auto grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:py-24">
          <div>
            <p className="mb-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#696963]"><span className="size-2 rounded-full bg-[#d8ff48]" /> En portada · 01</p>
            <h1 className="max-w-2xl font-serif text-[clamp(3.6rem,7.5vw,7.8rem)] leading-[.87] tracking-[-0.075em]">La tecnología <em className="font-serif font-normal text-[#77776f]">también</em> necesita silencio.</h1>
            <p className="mt-9 max-w-md text-[17px] leading-relaxed text-[#5d5d58]">Ideas, personas y productos que están cambiando nuestra manera de entender el mundo digital.</p>
            <a href="#historias" className="mt-10 inline-flex items-center gap-3 border-b border-black pb-2 text-xs font-bold uppercase tracking-[0.16em] transition-all hover:gap-5">Leer la historia <ArrowRight className="size-4" /></a>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-[#dedbd1] lg:aspect-[5/6]">
            <div className="absolute bottom-5 left-5 bg-[#f8f7f3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em]">Ensayo · Tecnología humana</div>
          </div>
        </section>
    )
}

export default FeaturedMain;
