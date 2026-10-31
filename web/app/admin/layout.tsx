import { redirect } from "next/navigation";

import AdminNav from "@/components/admin/admin-nav";
import { Logo } from "@/components/shared/logo";
import { getCurrentUser } from "@/lib/server/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#f4f4ef] text-[#171717]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6 lg:flex-row lg:px-8">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="mb-6 flex items-center gap-3">
            <Logo />
            <span className="rounded-full bg-[#171717] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
              Admin
            </span>
          </div>
          <AdminNav
            username={user.username}
            fullName={user.full_name}
            role={user.role}
          />
        </aside>
        <main className="min-w-0 flex-1 pb-10">{children}</main>
      </div>
    </div>
  );
}
