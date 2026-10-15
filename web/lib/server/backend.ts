import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiEndpoints } from "@/lib/api";
import { SERVER_API_URL } from "@/lib/server/api";

interface AuthedProxyOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  search?: string;
}

interface RefreshedTokens {
  access: string;
  refresh: string;
}

async function refreshTokens(): Promise<RefreshedTokens | null> {
  const store = await cookies();
  const refresh = store.get("refresh_token")?.value;
  if (!refresh) return null;

  try {
    const res = await fetch(`${SERVER_API_URL}${apiEndpoints.auth.refresh}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      access_token: string;
      refresh_token: string;
    };
    return { access: data.access_token, refresh: data.refresh_token };
  } catch {
    return null;
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export async function authedProxy(
  endpoint: string,
  { method = "GET", body, search = "" }: AuthedProxyOptions = {}
): Promise<NextResponse> {
  const store = await cookies();
  const access = store.get("access_token")?.value;
  if (!access) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const doFetch = (token: string) =>
    fetch(`${SERVER_API_URL}${endpoint}${search}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });

  let upstream = await doFetch(access);
  let refreshed: RefreshedTokens | null = null;

  if (upstream.status === 401) {
    refreshed = await refreshTokens();
    if (refreshed) {
      upstream = await doFetch(refreshed.access);
    }
  }

  const response =
    upstream.status === 204
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json(await upstream.json().catch(() => null), {
          status: upstream.status,
        });

  if (refreshed) {
    response.cookies.set("access_token", refreshed.access, cookieOptions());
    response.cookies.set("refresh_token", refreshed.refresh, cookieOptions());
  }

  return response;
}
