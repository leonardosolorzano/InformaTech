import { NextResponse } from "next/server";
import { apiEndpoints } from "@/lib/api";
import { SERVER_API_URL } from "@/lib/server/api";
import type { Token } from "@/lib/types";

interface LoginRequest {
  username?: unknown;
  password?: unknown;
}

function isTokenResponse(value: unknown): value is Token {
  if (!value || typeof value !== "object") return false;
  const tokens = value as Partial<Token>;
  return (
    typeof tokens.access_token === "string" &&
    typeof tokens.refresh_token === "string" &&
    typeof tokens.token_type === "string"
  );
}

export async function POST(request: Request) {
  let body: LoginRequest;
  try {
    body = (await request.json()) as LoginRequest;
  } catch {
    return NextResponse.json(
      { detail: "El cuerpo de la solicitud no contiene JSON válido." },
      { status: 400 },
    );
  }

  if (
    typeof body.username !== "string" ||
    !body.username.trim() ||
    typeof body.password !== "string" ||
    !body.password
  ) {
    return NextResponse.json(
      { detail: "Ingresa tu correo o usuario y contraseña." },
      { status: 400 },
    );
  }

  const formData = new URLSearchParams({
    username: body.username.trim(),
    password: body.password,
  });
  const upstream = await fetch(`${SERVER_API_URL}${apiEndpoints.auth.login}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
    cache: "no-store",
  });

  const data: unknown = await upstream.json();
  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  if (!isTokenResponse(data)) {
    return NextResponse.json(
      { detail: "El servidor de autenticación devolvió una respuesta inválida." },
      { status: 502 },
    );
  }

  const response = NextResponse.json({ ok: true });
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  response.cookies.set("access_token", data.access_token, cookieOptions);
  response.cookies.set("refresh_token", data.refresh_token, cookieOptions);
  return response;
}
