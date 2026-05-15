import type { Article, ArticleFormData, LoginCredentials, RegisterData, TokenResponse } from "./types";

export const BASE_URL = "http://127.0.0.1:8000";

export function imageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

function authHeaders(token?: string | null) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Error en la solicitud");
  }
  return res.json();
}

export async function fetchArticles(token?: string | null): Promise<Article[]> {
  const res = await fetch(`${BASE_URL}/articles/`, { headers: authHeaders(token) });
  return handleResponse(res);
}

export async function fetchArticle(id: number, token?: string | null): Promise<Article> {
  const res = await fetch(`${BASE_URL}/articles/${id}`, { headers: authHeaders(token) });
  return handleResponse(res);
}

export async function createArticle(data: ArticleFormData, token: string): Promise<Article> {
  const res = await fetch(`${BASE_URL}/articles/`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateArticle(id: number, data: Partial<ArticleFormData>, token: string): Promise<Article> {
  const res = await fetch(`${BASE_URL}/articles/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteArticle(id: number, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/articles/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Error al eliminar");
  }
}

export async function loginUser(credentials: LoginCredentials): Promise<TokenResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return handleResponse(res);
}

export async function uploadArticleImage(file: File, token: string): Promise<{ image_url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/articles/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
}

export async function registerUser(data: RegisterData): Promise<TokenResponse> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
