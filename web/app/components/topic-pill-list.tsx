import { ArrowUpRight } from "lucide-react";

import { fetchApiServer } from "@/lib/server/api";
import { apiEndpoints } from "@/lib/api";
import type { TagWithCount } from "@/lib/types";

async function getTopics(): Promise<TagWithCount[]> {
  try {
    const data = await fetchApiServer<TagWithCount[]>(apiEndpoints.tags.list);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const TopicPillList = async () => {
  const topics = await getTopics();

  return (
    <section id="tendencias" className="border-t border-black/15">
      <div className="max-w-7xl m-auto grid gap-10 py-20 md:grid-cols-[.8fr_1.2fr] md:gap-24">
        <div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#77776f]">
            Radar semanal
          </p>
          <h2 className="font-serif text-5xl leading-[.95] tracking-[-0.06em]">
            Lo que está
            <br />
            <em className="font-normal text-[#77776f]">por venir.</em>
          </h2>
        </div>

        {topics.length === 0 ? (
          <p className="text-sm text-[#85857d]">
            No hay etiquetas disponibles.
          </p>
        ) : (
          <div className="divide-y divide-black/15">
            {topics.map((topic, index) => (
              <a
                href="#historias"
                key={topic.id}
                className="group flex items-center justify-between py-5 text-xl transition-colors hover:text-[#77776f]"
              >
                <span>
                  <span className="mr-5 text-xs text-[#aaa99f]">
                    0{index + 1}
                  </span>
                  {topic.name}
                  <span className="ml-3 text-xs text-[#aaa99f]">
                    {topic.articles_count} artículos
                  </span>
                </span>
                <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopicPillList;
