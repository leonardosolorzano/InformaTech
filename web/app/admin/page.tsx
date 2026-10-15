"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Eye,
  FolderTree,
  Tags,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Pencil,
} from "lucide-react";
import type { AdminStats } from "@/lib/types";

function StatCard({
  label,
  value,
  icon: Icon,
  accent = "bg-[#d8ff48]",
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className={`mb-4 grid size-10 place-items-center rounded-xl ${accent}`}>
        <Icon className="size-5" />
      </div>
      <p className="text-3xl font-black tracking-tight">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#686860]">
        {label}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = (await res.json()) as AdminStats;
        if (active) setStats(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error cargando métricas");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#686860]">
          Resumen general del portal y accesos rápidos.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!stats && !error ? (
        <p className="text-sm text-[#686860]">Cargando métricas...</p>
      ) : stats ? (
        <>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Usuarios" value={stats.users} icon={Users} />
            <StatCard
              label="Publicados"
              value={stats.articles_published}
              icon={CheckCircle2}
            />
            <StatCard
              label="Pendientes"
              value={stats.articles_pending}
              icon={Clock}
              accent="bg-[#ffe08a]"
            />
            <StatCard label="Visitas totales" value={stats.total_views} icon={Eye} />
          </section>

          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total artículos" value={stats.articles_total} icon={FileText} />
            <StatCard label="Borradores" value={stats.articles_draft} icon={Pencil} />
            <StatCard
              label="Rechazados"
              value={stats.articles_rejected}
              icon={XCircle}
              accent="bg-[#ffd0d0]"
            />
            <StatCard label="Categorías" value={stats.categories} icon={FolderTree} />
          </section>

          <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white p-6">
            <div className="flex-1">
              <h2 className="text-lg font-bold">Acciones rápidas</h2>
              <p className="text-sm text-[#686860]">
                Publica una nueva nota o gestiona el contenido existente.
              </p>
            </div>
            <Link
              href="/admin/articles/new"
              className="inline-flex min-h-11 items-center rounded-xl bg-[#171717] px-5 text-sm font-bold text-white transition hover:bg-[#353535]"
            >
              Nueva publicación
            </Link>
            <Link
              href="/admin/articles"
              className="inline-flex min-h-11 items-center rounded-xl border border-black/15 px-5 text-sm font-bold transition hover:bg-black/5"
            >
              Ver artículos
            </Link>
            <Link
              href="/admin/categories"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/15 px-5 text-sm font-bold transition hover:bg-black/5"
            >
              <Tags className="size-4" />
              Categorías
            </Link>
          </section>
        </>
      ) : null}
    </div>
  );
}
