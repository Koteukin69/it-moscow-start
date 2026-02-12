import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, resolve, extname } from "path";
import { existsSync } from "fs";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".wasm": "application/wasm",
  ".data": "application/octet-stream",
  ".json": "application/json",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const gameDir = join(process.cwd(), "game");
  const filePath = resolve(gameDir, ...pathSegments);

  if (!filePath.startsWith(gameDir)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (!existsSync(filePath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const buffer = await readFile(filePath);
  const headers: Record<string, string> = {};

  const ext = extname(filePath).toLowerCase();

  if (ext === ".br") {
    headers["Content-Encoding"] = "br";
    const innerExt = extname(filePath.slice(0, -3)).toLowerCase();
    headers["Content-Type"] = MIME_TYPES[innerExt] || "application/octet-stream";
  } else {
    headers["Content-Type"] = MIME_TYPES[ext] || "application/octet-stream";
  }

  return new NextResponse(buffer, { headers });
}
