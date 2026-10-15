import { apiEndpoints } from "@/lib/api";
import { authedProxy } from "@/lib/server/backend";

export async function GET() {
  return authedProxy(apiEndpoints.admin.stats);
}
