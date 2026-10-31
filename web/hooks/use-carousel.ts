"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Carrusel con rotación automática.
 * Devuelve el índice activo y la navegación (ir a, anterior, siguiente).
 */
export function useCarousel(itemCount: number, intervalMs = 4000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (itemCount <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % itemCount);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [itemCount, intervalMs]);

  const goTo = useCallback(
    (next: number) => setIndex(((next % itemCount) + itemCount) % itemCount),
    [itemCount]
  );

  const prev = useCallback(() => goTo(index - 1), [index, goTo]);
  const next = useCallback(() => goTo(index + 1), [index, goTo]);

  return { index, goTo, prev, next };
}
