"use client";

import { useCallback, useEffect, useState } from "react";
import { toErrorMessage } from "@/lib/errors";
import { fetchJson } from "@/lib/http";
import type { Page, User, UserRole } from "@/lib/types";

/** Listado de usuarios y actualización de rol/estado desde el panel admin. */
export function useAdminUsers() {
  const [users, setUsers] = useState<Page<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const load = useCallback(
    () =>
      fetchJson<Page<User>>("/api/users?page=1&size=50", { cache: "no-store" }),
    []
  );

  useEffect(() => {
    let active = true;
    load()
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch((err) => {
        if (active) setError(toErrorMessage(err, "Error cargando usuarios"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load]);

  const updateUser = useCallback(
    async (userId: number, updates: { role?: UserRole; is_active?: boolean }) => {
      setUpdating(userId);
      setError(null);
      try {
        await fetchJson(`/api/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        setUsers(await load());
      } catch (err) {
        setError(toErrorMessage(err, "Error actualizando usuario"));
      } finally {
        setUpdating(null);
      }
    },
    [load]
  );

  return { users, loading, error, updating, updateUser };
}
