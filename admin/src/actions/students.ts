"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  studentSchema,
  studentUpdateSchema,
  type StudentFormValues,
  type StudentUpdateValues,
} from "@/schemas/student";
import type { Student } from "@/types";

type ActionResult =
  | { success: true }
  | { success?: never; error: Record<string, string[]> | string };

export async function getStudents(): Promise<Student[]> {
  const supabase = createAdminClient();

  // Get admin user IDs to filter them out
  const { data: adminUsers } = await supabase
    .from("admin_users")
    .select("user_id");
  const adminIds = new Set((adminUsers ?? []).map((a) => a.user_id));

  // List all auth users
  const { data: authData, error } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });
  if (error) throw new Error(error.message);

  // Get all profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name, avatar_url");
  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.user_id, p])
  );

  // Filter out admin users and map to Student type
  const students: Student[] = authData.users
    .filter((u) => !adminIds.has(u.id))
    .map((u) => {
      const profile = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        full_name: profile?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
        banned_until: u.banned_until ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return students;
}

export async function createStudent(
  formData: StudentFormValues
): Promise<ActionResult> {
  const validated = studentSchema.safeParse(formData);
  if (!validated.success) {
    return {
      error: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = createAdminClient();

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: validated.data.email,
      password: validated.data.password,
      email_confirm: true,
    });

  if (authError) return { error: { email: [authError.message] } };

  // Update profile with full_name
  if (authData.user) {
    await supabase
      .from("profiles")
      .upsert(
        {
          user_id: authData.user.id,
          full_name: validated.data.full_name,
        },
        { onConflict: "user_id" }
      );
  }

  revalidatePath("/students");
  return { success: true };
}

export async function updateStudent(
  id: string,
  formData: StudentUpdateValues
): Promise<ActionResult> {
  const validated = studentUpdateSchema.safeParse(formData);
  if (!validated.success) {
    return {
      error: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .upsert(
      { user_id: id, full_name: validated.data.full_name },
      { onConflict: "user_id" }
    );

  if (error) return { error: { full_name: [error.message] } };

  revalidatePath("/students");
  return { success: true };
}

export async function banStudent(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(id, {
    ban_duration: "876000h",
  });

  if (error) return { error: error.message };

  revalidatePath("/students");
  return { success: true };
}

export async function unbanStudent(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(id, {
    ban_duration: "none",
  });

  if (error) return { error: error.message };

  revalidatePath("/students");
  return { success: true };
}

export async function deleteStudent(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(id);

  if (error) return { error: error.message };

  revalidatePath("/students");
  return { success: true };
}
