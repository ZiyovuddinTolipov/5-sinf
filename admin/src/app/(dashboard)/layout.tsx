import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { admin_users } from "@/db/schema";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const [adminRow] = await db
    .select({ id: admin_users.id })
    .from(admin_users)
    .where(eq(admin_users.user_id, session.user.id))
    .limit(1);

  if (!adminRow) {
    await auth.api.signOut({ headers: await headers() });
    redirect("/login?error=not_admin");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header userEmail={session.user.email} />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
