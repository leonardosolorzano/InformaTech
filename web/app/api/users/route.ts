import { apiEndpoints } from "@/lib/api";
import { authedProxy } from "@/lib/server/backend";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.toString();
  return authedProxy(apiEndpoints.users.list, {
    search: query ? `?${query}` : "",
  });
}
