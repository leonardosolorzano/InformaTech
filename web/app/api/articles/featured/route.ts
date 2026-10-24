import { NextResponse } from "next/server";
import { fetchApiServer } from "@/lib/server/api";
import { apiEndpoints } from "@/lib/api";
import type { ArticleListItem } from "@/lib/types";

export async function GET() {
  try {
    const data = await fetchApiServer<ArticleListItem[]>(
      `${apiEndpoints.articles.list}/featured?limit=3`
    );
    return NextResponse.json(data ?? []);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error fetching featured articles";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
