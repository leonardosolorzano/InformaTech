import { apiEndpoints } from "@/lib/api";
import { authedProxy } from "@/lib/server/backend";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return authedProxy(apiEndpoints.users.changePassword, {
    method: "POST",
    body,
  });
}
