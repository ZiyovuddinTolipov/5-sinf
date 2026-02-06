import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_error`);
    }

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const adminClient = createAdminClient();
      const { data: adminUser } = await adminClient
        .from("admin_users")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!adminUser) {
        // Not an admin — sign out and redirect
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=not_admin`);
      }
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
