"use client";

import { USER_ROLES } from "@/lib/constants";
import type { Page, User, UserRole } from "@/lib/types";

interface UsersTableProps {
  users: Page<User> | null;
  updating: number | null;
  onUpdate: (userId: number, updates: { role?: UserRole; is_active?: boolean }) => void;
}

/** Tabla de gestión de usuarios (rol y estado). */
export function UsersTable({ users, updating, onUpdate }: UsersTableProps) {
  return (
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
                    onUpdate(user.id, { role: e.target.value as UserRole })
                  }
                >
                  {USER_ROLES.map((role) => (
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
                      onUpdate(user.id, { is_active: e.target.checked })
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
  );
}
