import "server-only";
import { cookies } from "next/headers";
import { apiEndpoints } from "@/lib/api";
import type { User } from "@/lib/types";

export const SERVER_API_URL =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api/v1";

async function fetchFromApi<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const base = endpoint.startsWith("http") ? "" : SERVER_API_URL;
  const url = `${base}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  };

  const response = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let errorData: unknown;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      errorData = await response.json();
    } else {
      errorData = await response.text();
    }
    throw errorData;
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  try {
    const user = await fetchFromApi<User>(apiEndpoints.users.me, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return user;
  } catch {
    return null;
  }
}
