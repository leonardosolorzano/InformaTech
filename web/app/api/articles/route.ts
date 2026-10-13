import { NextRequest, NextResponse } from "next/server";
import { fetchApiServer } from "@/lib/server/api";
import { ApiError } from "@/lib/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.toString();
  const endpoint = query ? `/articles?${query}` : "/articles";

  try {
    const data = await fetchApiServer(endpoint);
    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching articles" },
      { status }
    );
  }
}
