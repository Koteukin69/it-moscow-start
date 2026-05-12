import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const INTERNAL_SECRET = process.env.JWT_SECRET || "dev-secret-key-for-local-development-only";

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (req.headers.get("x-internal") !== INTERNAL_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ exists: false });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    return NextResponse.json({ exists: !!user });
  } catch {
    return NextResponse.json({ exists: true });
  }
}
