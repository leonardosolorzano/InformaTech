"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  FolderTree,
  Pencil,
  Tags,
  Users,
  XCircle,
} from "lucide-react";

import { StatCard } from "@/components/admin/stat-card";
import { FormMessage } from "@/components/shared/form-message";
import { useAdminStats } from "@/hooks/use-admin-stats";

export default function AdminDashboard() {
  const { stats, error } = useAdminStats();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#686860]">
          Resumen general del portal y accesos rápidos.
        </p>
      </header>

      {error && <FormMessage tone="error">{error}</FormMessage>}

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
