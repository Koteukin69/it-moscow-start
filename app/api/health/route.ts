export const dynamic = "force-dynamic";
import {NextResponse} from "next/server";

export async function GET() {
    return NextResponse.json({
        ok: true,
        status: "healthy",
        time: new Date().toISOString(),
    });
}