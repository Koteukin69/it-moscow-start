import {NextRequest, NextResponse} from "next/server";
import {ObjectId} from "mongodb";
import {usersCollection} from "@/lib/db/collections";

const INTERNAL_SECRET = process.env.JWT_SECRET || 'dev-secret-key-for-local-development-only';

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (req.headers.get("x-internal") !== INTERNAL_SECRET) {
    return NextResponse.json({error: "Forbidden"}, {status: 403});
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({exists: false});
  }

  try {
    const collection = await usersCollection;
    const user = await collection.findOne({_id: new ObjectId(id)}, {projection: {_id: 1}});
    return NextResponse.json({exists: !!user});
  } catch {
    return NextResponse.json({exists: true});
  }
}
