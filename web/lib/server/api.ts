import "server-only";
import { ApiError } from "@/lib/api";

export const SERVER_API_URL =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api/v1";

export async function fetchApiServer<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const base = endpoint.startsWith("http") ? "" : SERVER_API_URL;
  const url = `${base}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    ...options,
    headers,
    cache: "no-store",
    next: { revalidate: 60 },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData: unknown;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        errorData = await response.json();
      } else {
        errorData = await response.text();
      }
      const detail =
        typeof (errorData as Record<string, unknown>)?.detail === "string"
          ? (errorData as Record<string, string>).detail
          : `Error ${response.status}: ${response.statusText}`;
      throw new ApiError(response.status, detail, errorData);
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : "Error de conexión");
  }
}
