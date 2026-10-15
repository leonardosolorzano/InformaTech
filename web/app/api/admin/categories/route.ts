import { apiEndpoints } from "@/lib/api";
import { authedProxy } from "@/lib/server/backend";

export async function GET() {
  return authedProxy(apiEndpoints.categories.list);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return authedProxy(apiEndpoints.categories.create, { method: "POST", body });
}
