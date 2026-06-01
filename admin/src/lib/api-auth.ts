import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw Object.assign(new Error("UNAUTHENTICATED"), { status: 401 });
  }
  return session.user;
}

export function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
