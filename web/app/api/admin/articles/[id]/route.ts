import { apiEndpoints } from "@/lib/api";
import { authedProxy } from "@/lib/server/backend";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return authedProxy(apiEndpoints.admin.article(Number(id)));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return authedProxy(apiEndpoints.admin.article(Number(id)), {
    method: "PATCH",
    body,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return authedProxy(apiEndpoints.admin.article(Number(id)), { method: "DELETE" });
}
