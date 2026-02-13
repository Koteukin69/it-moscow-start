import {NextRequest, NextResponse} from "next/server";
import {writeFile, mkdir} from "fs/promises";
import {join} from "path";
import {randomUUID} from "crypto";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({error: "Файл не найден"}, {status: 400});
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({error: "Допустимы только изображения (JPEG, PNG, WebP, GIF, SVG)"}, {status: 422});
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({error: "Максимальный размер файла — 5 МБ"}, {status: 422});
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, {recursive: true});

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(uploadDir, filename), buffer);

    return NextResponse.json({url: `/uploads/${filename}`});
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Ошибка загрузки файла"}, {status: 500});
  }
}
