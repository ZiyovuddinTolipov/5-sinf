import { mkdir, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

async function ensureDir(dir: string) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
}

export async function saveFile(bucket: string, file: File, subdir?: string): Promise<string> {
  const dir = path.join(UPLOAD_DIR, bucket, subdir ?? "");
  await ensureDir(dir);
  const ext = path.extname(file.name) || "";
  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  const filepath = path.join(dir, filename);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buf);
  const rel = path.posix.join(bucket, subdir ?? "", filename);
  return `/api/files/${rel}`;
}

export async function deleteFileByPublicUrl(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const marker = "/api/files/";
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const rel = url.slice(idx + marker.length);
  const filepath = path.join(UPLOAD_DIR, rel);
  try {
    await unlink(filepath);
  } catch {
    // ignore
  }
}

export function resolvePublicPath(rel: string): string {
  return path.join(UPLOAD_DIR, rel);
}

export { UPLOAD_DIR };
