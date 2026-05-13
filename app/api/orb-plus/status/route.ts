import { NextRequest, NextResponse } from "next/server";
import { getOrbStatus, ORB_PRO_DAILY_LIMIT_FREE } from "@/lib/orb-plus";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({
      authenticated: false,
      plusActive: false,
      plusExpiresAt: null,
      limit: ORB_PRO_DAILY_LIMIT_FREE,
      used: 0,
      remaining: ORB_PRO_DAILY_LIMIT_FREE,
      resetAt: null,
    });
  }

  const status = await getOrbStatus(userId);
  return NextResponse.json({ authenticated: true, ...status });
}
