"use client";

import { useEffect, useState } from "react";
import { toErrorMessage } from "@/lib/errors";
import { fetchJson } from "@/lib/http";
import type { AdminStats } from "@/lib/types";

/** Métricas del dashboard admin. */
export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchJson<AdminStats>("/api/admin/stats", { cache: "no-store" })
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err) => {
        if (active) setError(toErrorMessage(err, "Error cargando métricas"));
      });
    return () => {
      active = false;
    };
  }, []);

  return { stats, error };
}
