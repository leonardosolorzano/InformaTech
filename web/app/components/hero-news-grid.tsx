const stories = [
  {
    title: "La inteligencia artificial y su impacto en la sociedad",
    category: "Inteligencia Artificial",
    time: "5 min de lectura",
    image: "/images/hero-news-grid-1.jpg",
  },
  {
    title: "Ciberseguridad en la era digital: desafíos y soluciones",
    category: "Ciberseguridad",
    time: "7 min de lectura",
    image: "/images/hero-news-grid-2.jpg",
  },
  {
    title: "Computación cuántica: el futuro de la informática",
    category: "Computación Cuántica",
    time: "6 min de lectura",
    image: "/images/hero-news-grid-3.jpg",
  },
];

import { Bookmark, Clock3 } from "lucide-react";
import Image from "next/image";

const HeroNewsGrid = () => {
  return (
    <section id="historias" className="border-t border-black/15 py-20">
      <div className="max-w-7xl m-auto ">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#77776f]">
              Lo último
            </p>
            <h2 className="font-serif text-5xl tracking-[-0.06em]">
              Historias para hoy
            </h2>
          </div>
          <a
            href="#tendencias"
            className="hidden text-xs font-bold uppercase tracking-[0.15em] underline underline-offset-4 sm:block"
          >
            Ver todas
          </a>
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          {stories.map((story) => (
            <article key={story.title} className="group cursor-pointer">
              <div className="relative mb-5 aspect-[4/3] overflow-hidden bg-[#e9e7df]">
                <Image
                  src={story.image}
                  alt=""
                  fill
                  className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <button
                  className="absolute right-3 top-3 rounded-full bg-[#f8f7f3]/90 p-2"
                  aria-label={`Guardar ${story.title}`}
                >
                  <Bookmark className="size-4" />
                </button>
              </div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7a7a72]">
                {story.category}
              </p>
              <h3 className="font-serif text-2xl leading-[1.05] tracking-[-0.04em] transition-colors group-hover:text-[#67675f]">
                {story.title}
              </h3>
              <p className="mt-4 flex items-center gap-2 text-xs text-[#85857d]">
                <Clock3 className="size-3" /> {story.time}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroNewsGrid;
