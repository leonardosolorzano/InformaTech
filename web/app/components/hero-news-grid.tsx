import { Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { fetchApiServer } from "@/lib/server/api";
import { apiEndpoints, getImageUrl } from "@/lib/api";
import type { Page, ArticleListItem } from "@/lib/types";

async function getStories(): Promise<ArticleListItem[]> {
  try {
    const data = await fetchApiServer<Page<ArticleListItem>>(
      `${apiEndpoints.articles.list}?page=1&size=6&sort=newest`
    );
    return data.items ?? [];
  } catch {
    return [];
  }
}

const HeroNewsGrid = async () => {
  const stories = await getStories();

  return (
    <section id="historias" className="border-t border-black/15 py-20">
      <div className="max-w-7xl m-auto">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#77776f]">
              Lo último
            </p>
            <h2 className="font-serif text-5xl tracking-[-0.06em]">
              Historias para hoy
            </h2>
          </div>
          <Link
            href="#tendencias"
            className="hidden text-xs font-bold uppercase tracking-[0.15em] underline underline-offset-4 sm:block"
          >
            Ver todas
          </Link>
        </div>

        {stories.length === 0 ? (
          <p className="text-sm text-[#85857d]">
            Aún no hay artículos publicados.
          </p>
        ) : (
          <div className="grid gap-10 md:grid-cols-3">
            {stories.map((story) => {
              const cover = getImageUrl(story.cover_image_url);
              return (
                <Link
                  href={`/noticias/${story.slug}`}
                  key={story.id}
                  className="group block cursor-pointer"
                >
                  <div className="relative mb-5 aspect-[4/3] overflow-hidden bg-[#e9e7df]">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={story.title}
                        fill
                        className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#aaa99f]">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7a7a72]">
                    {story.category?.name ?? story.author?.username ?? "General"}
                  </p>
                  <h3 className="font-serif text-2xl leading-[1.05] tracking-[-0.04em] transition-colors group-hover:text-[#67675f]">
                    {story.title}
                  </h3>
                  <p className="mt-4 flex items-center gap-2 text-xs text-[#85857d]">
                    <Clock3 className="size-3" />{" "}
                    {story.published_at
                      ? new Date(story.published_at).toLocaleDateString("es", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Recientemente"}
                    {" · "}
                    {story.views_count} vistas
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroNewsGrid;
