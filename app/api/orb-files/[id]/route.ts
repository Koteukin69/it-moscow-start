import { NextRequest, NextResponse } from "next/server";
import { getMimeType, readGeneratedFile } from "@/lib/orb-files";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const file = await readGeneratedFile(id);
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = new Uint8Array(file.buffer);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": getMimeType(file.type),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
