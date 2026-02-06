import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Admin check
  const adminClient = createAdminClient();
  const { data: adminUser } = await adminClient
    .from("admin_users")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!adminUser) {
    await supabase.auth.signOut();
    redirect("/login?error=not_admin");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header userEmail={user.email} />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
