import "server-only";
import { cookies } from "next/headers";
import { apiEndpoints } from "@/lib/api";
import { fetchApiServer } from "@/lib/server/api";
import type { User } from "@/lib/types";

/**
 * Obtiene el usuario actual a partir de la cookie `access_token`.
 * Devuelve `null` si no hay sesión o si el token ya no es válido.
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  try {
    return await fetchApiServer<User>(apiEndpoints.users.me, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return null;
  }
}
