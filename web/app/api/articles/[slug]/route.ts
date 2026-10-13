import { NextResponse } from "next/server";
import { fetchApiServer } from "@/lib/server/api";
import { ApiError } from "@/lib/api";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const data = await fetchApiServer(`/articles/${slug}`);
    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 404;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Article not found" },
      { status }
    );
  }
}
