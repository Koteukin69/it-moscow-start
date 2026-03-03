import {NextRequest, NextResponse} from "next/server";
import {writeFile, mkdir} from "fs/promises";
import {join} from "path";
import {randomUUID} from "crypto";
import sharp from "sharp";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB — до сжатия
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const uploadDir = join(process.cwd(), "uploads");
const ensureDir = mkdir(uploadDir, {recursive: true}).catch(() => {});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await ensureDir;

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({error: "Файл не найден"}, {status: 400});
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({error: "Допустимы только изображения (JPEG, PNG, WebP, GIF)"}, {status: 422});
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({error: "Максимальный размер файла — 10 МБ"}, {status: 422});
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const compressed = await sharp(buffer)
      .resize(1200, 1200, {fit: "inside", withoutEnlargement: true})
      .webp({quality: 82})
      .toBuffer();

    const filename = `${randomUUID()}.webp`;
    await writeFile(join(uploadDir, filename), compressed);

    return NextResponse.json({url: `/uploads/${filename}`});
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Ошибка загрузки файла"}, {status: 500});
  }
}
