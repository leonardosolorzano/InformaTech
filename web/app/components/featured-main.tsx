import { ArrowRight, Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { apiEndpoints, getImageUrl } from "@/lib/api";
import { fetchApiServer } from "@/lib/server/api";
import type { ArticleListItem, Page } from "@/lib/types";

const MAX_FEATURED = 3;

/**
 * Trae las noticias de portada desde la API del backend:
 * primero los artículos marcados como destacados y, si faltan, completa con
 * los más recientes para que la portada siempre muestre tres.
 */
async function getFeaturedArticles(): Promise<ArticleListItem[]> {
  const featured = await fetchApiServer<ArticleListItem[]>(
    `${apiEndpoints.articles.list}/featured?limit=${MAX_FEATURED}`
  );

  const items = (Array.isArray(featured) ? featured : []).slice(0, MAX_FEATURED);
  if (items.length >= MAX_FEATURED) return items;

  const latest = await fetchApiServer<Page<ArticleListItem>>(
    `${apiEndpoints.articles.list}?page=1&size=${MAX_FEATURED * 2}&sort=newest`
  );

  const seen = new Set(items.map((article) => article.id));
  for (const article of latest.items ?? []) {
    if (items.length >= MAX_FEATURED) break;
    if (seen.has(article.id)) continue;
    seen.add(article.id);
    items.push(article);
  }

  return items;
}

function formatDate(article: ArticleListItem): string {
  const date = article.published_at ?? article.created_at;
  return new Date(date).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const FeaturedMain = async () => {
  let stories: ArticleListItem[] = [];
  let errorMessage: string | null = null;

  try {
    stories = await getFeaturedArticles();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "No se pudieron cargar las noticias destacadas.";
  }

  if (errorMessage) {
    return (
      <section className="max-w-7xl m-auto py-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#85857d]">
          No fue posible cargar las noticias destacadas: {errorMessage}
        </p>
      </section>
    );
  }

  if (stories.length === 0) {
    return (
      <section className="max-w-7xl m-auto grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:py-24">
        <div>
          <p className="mb-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#696963]">
            <span className="size-2 rounded-full bg-[#d8ff48]" /> En portada · 01
          </p>
          <h1 className="max-w-2xl font-serif text-[clamp(3.6rem,7.5vw,7.8rem)] leading-[.87] tracking-[-0.075em]">
            La tecnología <em className="font-serif font-normal text-[#77776f]">también</em> necesita silencio.
          </h1>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-[#dedbd1] lg:aspect-[5/6]">
          <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#aaa99f]">
            Sin destacados
          </div>
        </div>
      </section>
    );
  }

  const [mainStory, ...rest] = stories;
  const sideStories = rest.slice(0, 2);
  const mainCover = getImageUrl(mainStory.cover_image_url);
  const hasSidebar = sideStories.length > 0;

  return (
    <section
      className={`max-w-7xl m-auto grid items-start gap-12 py-14 lg:gap-14 lg:py-20 ${
        hasSidebar ? "lg:grid-cols-[1.65fr_1fr]" : ""
      }`}
      aria-label="Noticias destacadas"
    >
      {/* Portada principal */}
      <article className="group">
        <Link href={`/noticias/${mainStory.slug}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#dedbd1] sm:aspect-[16/9]">
            {mainCover ? (
              <Image
                src={mainCover}
                alt={mainStory.title}
                fill
                loading="eager"
                fetchPriority="high"
                className="object-cover transition duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 65vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#aaa99f]">
                Sin imagen
              </div>
            )}
            <span className="absolute left-4 top-4 bg-[#f8f7f3] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em]">
              {mainStory.category?.name ?? "Ensayo · Tecnología humana"}
            </span>
          </div>

          <p className="mt-7 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#696963]">
            <span className="size-2 rounded-full bg-[#d8ff48]" /> En portada
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-[clamp(2.6rem,4.6vw,4.4rem)] leading-[.9] tracking-[-0.06em] transition-colors group-hover:text-[#67675f]">
            {mainStory.title}
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[#5d5d58]">
            {mainStory.summary}
          </p>
          <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#85857d]">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-3" /> {formatDate(mainStory)}
            </span>
            <span>{mainStory.views_count} vistas</span>
            <span>{mainStory.author?.username ?? "Redacción"}</span>
          </p>
          <span className="mt-8 inline-flex items-center gap-3 border-b border-black pb-2 text-xs font-bold uppercase tracking-[0.16em] transition-all group-hover:gap-5">
            Leer la historia <ArrowRight className="size-4" />
          </span>
        </Link>
      </article>

      {/* Sidebar con los otros dos destacados */}
      {hasSidebar && (
        <aside aria-label="Más noticias destacadas">
          <div className="flex items-baseline justify-between border-b border-black pb-3">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#696963]">
              Más destacadas
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#aaa99f]">
              {String(sideStories.length).padStart(2, "0")} historias
            </span>
          </div>

          <div className="divide-y divide-black/15">
            {sideStories.map((story) => {
              const cover = getImageUrl(story.cover_image_url);
              return (
                <Link
                  key={story.id}
                  href={`/noticias/${story.slug}`}
                  className="group flex gap-4 py-6 first:pt-5 lg:block"
                >
                  <div className="relative aspect-square w-24 shrink-0 overflow-hidden bg-[#e9e7df] lg:aspect-[16/9] lg:w-full">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={story.title}
                        fill
                        className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                        sizes="(max-width: 1024px) 96px, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[9px] font-bold uppercase tracking-[0.15em] text-[#aaa99f]">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 lg:mt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7a7a72]">
                      {story.category?.name ?? "General"}
                    </p>
                    <h3 className="mt-2 font-serif text-xl leading-[1.08] tracking-[-0.03em] transition-colors group-hover:text-[#67675f] lg:text-2xl">
                      {story.title}
                    </h3>
                    <p className="mt-3 flex items-center gap-2 text-[11px] text-[#85857d]">
                      <Clock3 className="size-3" /> {formatDate(story)}
                      {" · "}
                      {story.views_count} vistas
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>
      )}
    </section>
  );
};

export default FeaturedMain;
