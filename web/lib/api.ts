const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const API_DIRECT_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const base = endpoint.startsWith("http") ? "" : API_BASE_URL;
  const url = `${base}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    ...options,
    headers,
    cache: "no-store",
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
          ? ((errorData as Record<string, string>).detail)
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

export const apiEndpoints = {
  articles: {
    list: "/articles",
    get: (slug: string) => `/articles/${slug}`,
    create: "/articles",
    update: (id: number) => `/articles/${id}`,
    delete: (id: number) => `/articles/${id}`,
    submit: (id: number) => `/articles/${id}/submit`,
    review: (id: number) => `/articles/${id}/review`,
    cover: (id: number) => `/articles/${id}/cover`,
    my: "/articles/me",
    moderation: "/articles/moderation/queue",
  },
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
  },
  categories: {
    list: "/categories",
    get: (slug: string) => `/categories/${slug}`,
    create: "/categories",
    update: (id: number) => `/categories/${id}`,
    delete: (id: number) => `/categories/${id}`,
  },
  tags: {
    list: "/tags",
  },
  users: {
    me: "/users/me",
    get: (username: string) => `/users/${username}`,
  },
  health: "/health",
} as const;

export const getImageUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${API_DIRECT_URL}${url}`;
  return url;
};

export { API_BASE_URL, API_DIRECT_URL };
