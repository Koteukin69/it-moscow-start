import {NextRequest, NextResponse} from "next/server";
import {quizResultsCollection} from "@/lib/db/collections";
import {verifyToken} from "@/lib/auth";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const token = req.cookies.get("auth-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({error: "Unauthorized"}, {status: 401});

    const {directions, top} = await req.json();
    if (!directions || !top) {
      return NextResponse.json({error: "Missing directions or top"}, {status: 422});
    }

    const collection = await quizResultsCollection;
    await collection.updateOne(
      {userId: payload.userId},
      {$set: {userId: payload.userId, directions, top, completedAt: new Date()}},
      {upsert: true}
    );

    return NextResponse.json({success: true});
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Внутренняя ошибка сервера"}, {status: 500});
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const token = req.cookies.get("auth-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({error: "Unauthorized"}, {status: 401});

    const collection = await quizResultsCollection;
    const result = await collection.findOne({userId: payload.userId});

    if (!result) return NextResponse.json({result: null});

    return NextResponse.json({
      result: {
        directions: result.directions,
        top: result.top,
        completedAt: result.completedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Внутренняя ошибка сервера"}, {status: 500});
  }
}
