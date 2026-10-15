import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiEndpoints } from "@/lib/api";
import { SERVER_API_URL } from "@/lib/server/api";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const incoming = await request.formData();

  const upstream = await fetch(
    `${SERVER_API_URL}${apiEndpoints.articles.cover(Number(id))}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: incoming,
      cache: "no-store",
    }
  );

  const data: unknown = await upstream.json().catch(() => null);
  return NextResponse.json(data, { status: upstream.status });
}
