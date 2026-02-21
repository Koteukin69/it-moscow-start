import {NextRequest, NextResponse} from "next/server";
import {readFile} from "fs/promises";
import {join} from "path";
import {existsSync} from "fs";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const uploadsDir = join(process.cwd(), "uploads");

export async function GET(
  _request: NextRequest,
  {params}: {params: Promise<{filename: string}>}
) {
  const {filename} = await params;

  if (!/^[\w-]+\.\w+$/.test(filename)) {
    return new NextResponse("Bad Request", {status: 400});
  }

  const ext = "." + filename.split(".").pop()!.toLowerCase();
  const contentType = MIME_TYPES[ext];

  if (!contentType) {
    return new NextResponse("Not Found", {status: 404});
  }

  const filePath = join(uploadsDir, filename);

  if (!filePath.startsWith(uploadsDir)) {
    return new NextResponse("Forbidden", {status: 403});
  }

  if (!existsSync(filePath)) {
    return new NextResponse("Not Found", {status: 404});
  }

  const buffer = await readFile(filePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
