"use client";

import { useCallback, useEffect, useState } from "react";
import type { Page, User, UserRole } from "@/lib/types";

const ROLES: UserRole[] = ["user", "editor", "admin"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Page<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/users?page=1&size=50", { cache: "no-store" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || `Error ${res.status}`);
    }
    return (await res.json()) as Page<User>;
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const data = await loadUsers();
        if (active) setUsers(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Error cargando usuarios");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadUsers]);

  async function updateUser(
    userId: number,
    updates: { role?: UserRole; is_active?: boolean }
  ) {
    setUpdating(userId);
    setError(null);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Error ${res.status}`);
      }
      setUsers(await loadUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error actualizando usuario");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-[#686860]">Cargando usuarios...</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">
          Administración de usuarios
        </h1>
        <p className="text-sm text-[#686860]">
          Asigna roles y activa/desactiva cuentas desde aquí.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-black/5 text-sm">
          <thead className="bg-[#f8f7f3]">
            <tr>
              <th className="px-6 py-3 text-left font-bold uppercase tracking-[0.12em] text-[#686860]">
                Usuario
              </th>
              <th className="px-6 py-3 text-left font-bold uppercase tracking-[0.12em] text-[#686860]">
                Email
              </th>
              <th className="px-6 py-3 text-left font-bold uppercase tracking-[0.12em] text-[#686860]">
                Rol
              </th>
              <th className="px-6 py-3 text-left font-bold uppercase tracking-[0.12em] text-[#686860]">
                Estado
              </th>
              <th className="px-6 py-3 text-left font-bold uppercase tracking-[0.12em] text-[#686860]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {users?.items.map((user) => (
              <tr key={user.id} className="hover:bg-[#f8f7f3]/60">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-xs text-[#686860]">
                      {user.full_name || "-"}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#686860]">{user.email}</td>
                <td className="px-6 py-4">
                  <select
                    className="rounded-lg border border-black/10 bg-white px-2 py-1 text-sm"
                    value={user.role}
                    disabled={updating === user.id}
                    onChange={(e) =>
                      updateUser(user.id, { role: e.target.value as UserRole })
                    }
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={user.is_active}
                      disabled={updating === user.id}
                      onChange={(e) =>
                        updateUser(user.id, { is_active: e.target.checked })
                      }
                    />
                    {user.is_active ? "Activo" : "Inactivo"}
                  </label>
                </td>
                <td className="px-6 py-4 text-[#686860]">
                  {updating === user.id ? "Guardando..." : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
