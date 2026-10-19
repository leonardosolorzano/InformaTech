import Image from "next/image";

import { getImageUrl } from "@/lib/api";
import type { ArticleListItem } from "@/lib/types";

interface FeaturedSlideProps {
  item: ArticleListItem;
  isActive: boolean;
}

/** Slide apilado del carrusel de portada (imagen + etiqueta de categoría). */
export function FeaturedSlide({ item, isActive }: FeaturedSlideProps) {
  const cover = getImageUrl(item.cover_image_url);

  return (
    <div
      className={[
        "absolute inset-0 flex flex-col transition-all duration-500 ease-in-out",
        isActive
          ? "pointer-events-auto z-10 translate-x-0 opacity-100"
          : "pointer-events-none -translate-x-4 opacity-0",
      ].join(" ")}
    >
      {cover ? (
        <Image
          src={cover}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      ) : null}
      <div className="absolute bottom-5 left-5 bg-[#f8f7f3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em]">
        {item.category?.name ?? "Ensayo · Tecnología humana"}
      </div>
    </div>
  );
}
