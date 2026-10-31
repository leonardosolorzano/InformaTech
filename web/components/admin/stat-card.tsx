import type { ComponentType } from "react";

interface StatCardProps {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  accent?: string;
}

/** Tarjeta de métrica del dashboard admin. */
export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "bg-[#d8ff48]",
}: StatCardProps) {
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
