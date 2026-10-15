import { apiEndpoints } from "@/lib/api";
import { authedProxy } from "@/lib/server/backend";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return authedProxy(apiEndpoints.categories.update(Number(id)), {
    method: "PUT",
    body,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return authedProxy(apiEndpoints.categories.delete(Number(id)), {
    method: "DELETE",
  });
}
