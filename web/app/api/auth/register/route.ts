import { NextResponse } from "next/server";
import { apiEndpoints } from "@/lib/api";
import { SERVER_API_URL } from "@/lib/server/api";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { detail: "El cuerpo de la solicitud no contiene JSON válido." },
      { status: 400 },
    );
  }

  const response = await fetch(`${SERVER_API_URL}${apiEndpoints.auth.register}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data: unknown = await response.json();
  return NextResponse.json(data, { status: response.status });
}
