"use client";

import { UsersTable } from "@/components/admin/users-table";
import { FormMessage } from "@/components/shared/form-message";
import { useAdminUsers } from "@/hooks/use-admin-users";

export default function AdminUsersPage() {
  const { users, loading, error, updating, updateUser } = useAdminUsers();

  if (loading) {
    return <p className="text-sm text-[#686860]">Cargando usuarios...</p>;
  }

  if (error) {
    return <FormMessage tone="error">{error}</FormMessage>;
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

      <UsersTable users={users} updating={updating} onUpdate={updateUser} />
    </div>
  );
}
