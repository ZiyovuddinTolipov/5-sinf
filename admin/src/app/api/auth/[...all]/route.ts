import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const trusted = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && trusted.includes(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type,authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Expose-Headers": "set-auth-token,set-auth-jwt",
    Vary: "Origin",
  };
}

const handlers = toNextJsHandler(auth);

export async function POST(req: Request) {
  const res = await handlers.POST(req);
  const headers = corsHeaders(req.headers.get("origin"));
  for (const [k, v] of Object.entries(headers)) if (v) res.headers.set(k, v);
  return res;
}

export async function GET(req: Request) {
  const res = await handlers.GET(req);
  const headers = corsHeaders(req.headers.get("origin"));
  for (const [k, v] of Object.entries(headers)) if (v) res.headers.set(k, v);
  return res;
}

export async function OPTIONS(req: Request) {
  const headers = corsHeaders(req.headers.get("origin"));
  return new Response(null, { status: 204, headers });
}
