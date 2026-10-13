import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { fetchApiServer } from "@/lib/server/api";
import { apiEndpoints, getImageUrl } from "@/lib/api";
import type { Page, ArticleListItem } from "@/lib/types";

async function getFeatured(): Promise<ArticleListItem | null> {
  try {
    const data = await fetchApiServer<Page<ArticleListItem>>(
      `${apiEndpoints.articles.list}?page=1&size=1&sort=newest`
    );
    return data.items?.[0] ?? null;
  } catch {
    return null;
  }
}

const FeaturedMain = async () => {
  const featured = await getFeatured();
  const cover = featured ? getImageUrl(featured.cover_image_url) : null;

  return (
    <section className="max-w-7xl m-auto grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:py-24">
      <div>
        <p className="mb-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#696963]">
          <span className="size-2 rounded-full bg-[#d8ff48]" /> En portada · 01
        </p>

        {featured ? (
          <Link href={`/noticias/${featured.slug}`} className="group">
            <h1 className="max-w-2xl font-serif text-[clamp(3.6rem,7.5vw,7.8rem)] leading-[.87] tracking-[-0.075em] group-hover:text-[#67675f]">
              {featured.title}
            </h1>
            <p className="mt-9 max-w-md text-[17px] leading-relaxed text-[#5d5d58]">
              {featured.summary}
            </p>
            <span className="mt-10 inline-flex items-center gap-3 border-b border-black pb-2 text-xs font-bold uppercase tracking-[0.16em] transition-all hover:gap-5">
              Leer la historia <ArrowRight className="size-4" />
            </span>
          </Link>
        ) : (
          <h1 className="max-w-2xl font-serif text-[clamp(3.6rem,7.5vw,7.8rem)] leading-[.87] tracking-[-0.075em]">
            La tecnología <em className="font-serif font-normal text-[#77776f]">también</em> necesita silencio.
          </h1>
        )}
      </div>

      <div className="relative aspect-[4/5] overflow-hidden bg-[#dedbd1] lg:aspect-[5/6]">
        {cover && featured ? (
          <Image
            src={cover}
            alt={featured.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : null}
        <div className="absolute bottom-5 left-5 bg-[#f8f7f3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em]">
          {featured?.category?.name ?? "Ensayo · Tecnología humana"}
        </div>
      </div>
    </section>
  );
};

export default FeaturedMain;
