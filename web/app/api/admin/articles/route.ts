import { apiEndpoints } from "@/lib/api";
import { authedProxy } from "@/lib/server/backend";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.toString();
  return authedProxy(apiEndpoints.admin.articles, {
    search: query ? `?${query}` : "",
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return authedProxy(apiEndpoints.admin.articles, { method: "POST", body });
}
