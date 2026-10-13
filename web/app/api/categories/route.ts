import { NextResponse } from "next/server";
import { fetchApiServer } from "@/lib/server/api";
import { ApiError } from "@/lib/api";

export async function GET() {
  try {
    const data = await fetchApiServer("/categories");
    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching categories" },
      { status }
    );
  }
}
