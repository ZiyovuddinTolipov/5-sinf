import { createReadStream, statSync } from "node:fs";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { resolvePublicPath } from "@/lib/storage";

const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await ctx.params;
  const rel = parts.join("/");

  if (rel.includes("..")) {
    return NextResponse.json({ error: "Bad path" }, { status: 400 });
  }

  const filepath = resolvePublicPath(rel);

  let stats;
  try {
    stats = statSync(filepath);
    if (!stats.isFile()) throw new Error("not file");
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = path.extname(filepath).toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";

  const stream = createReadStream(filepath);
  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stats.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
