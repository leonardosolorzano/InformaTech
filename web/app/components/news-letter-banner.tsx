'use client';

import { ArrowRight } from "lucide-react";
import { useState } from "react";

const NewsletterBanner = () => {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section
      id="newsletter"
      className="max-w-7xl m-auto mb-20 grid gap-8 bg-[#171717] px-7 py-12 text-[#f8f7f3] md:grid-cols-[1fr_1fr] md:px-14 md:py-16"
    >
      <div>
        <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d8ff48]">
          El briefing
        </p>
        <h2 className="max-w-md font-serif text-5xl leading-[.92] tracking-[-0.06em]">
          Tecnología, sin ruido.
        </h2>
      </div>
      <div className="flex flex-col justify-end">
        <p className="mb-6 max-w-sm text-sm leading-relaxed text-white/60">
          Una selección semanal de las ideas que merece la pena leer. Directa a
          tu bandeja.
        </p>
        {subscribed ? (
          <p className="border-b border-[#d8ff48] pb-3 text-sm text-[#d8ff48]">
            Gracias. Revisa tu bandeja de entrada.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubscribed(true);
            }}
            className="flex border-b border-white/30 pb-3"
          >
            <input
              required
              type="email"
              placeholder="tu@email.com"
              aria-label="Tu email"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
            />
            <button
              type="submit"
              className="text-xs font-bold uppercase tracking-[0.12em] text-[#d8ff48]"
            >
              Suscribirme <ArrowRight className="ml-2 inline size-4" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default NewsletterBanner;
