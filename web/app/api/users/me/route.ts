import { apiEndpoints } from "@/lib/api";
import { authedProxy } from "@/lib/server/backend";

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  return authedProxy(apiEndpoints.users.me, { method: "PATCH", body });
}
