import {NextRequest, NextResponse} from "next/server";
import {writeFile, mkdir} from "fs/promises";
import {join} from "path";
import {randomBytes} from "crypto";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({error: "Файл не выбран"}, {status: 422});
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({error: "Допустимы только изображения"}, {status: 422});
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({error: "Файл слишком большой (макс. 5 МБ)"}, {status: 422});
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const allowedExts = ["jpg", "jpeg", "png", "webp", "gif", "svg"];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json({error: "Недопустимый формат файла"}, {status: 422});
    }

    const fileName = `${randomBytes(16).toString("hex")}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, {recursive: true});

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(uploadDir, fileName), buffer);

    return NextResponse.json({url: `/uploads/${fileName}`});
  } catch {
    return NextResponse.json({error: "Ошибка загрузки"}, {status: 500});
  }
}
