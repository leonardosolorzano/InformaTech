import { NextResponse } from "next/server";
import { fetchApiServer } from "@/lib/server/api";

export async function GET() {
  try {
    const data = await fetchApiServer("/health");
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
