import {NextRequest, NextResponse} from "next/server";
import {specialtiesCollection} from "@/lib/db/collections";
import {specialtyDefaults} from "@/lib/specialty-defaults";
import type {SpecialtyData, BudgetPlaceEntry} from "@/lib/types";

const VALID_ORBS = new Set(["cyan", "aurora", "sunset", "neon"]);
const KNOWN_IDS = new Set(specialtyDefaults.map(s => s.id));

export async function PUT(req: NextRequest, {params}: {params: Promise<{id: string}>}): Promise<NextResponse> {
  try {
    const {id} = await params;
    if (!KNOWN_IDS.has(id)) {
      return NextResponse.json({error: "Неизвестная специальность"}, {status: 400});
    }

    const body = await req.json();
    const {code, title, description, relevance, curriculum, targetAudience, careers, image, icons, orb, budgetPlaces} = body;

    if (!code || !title || !description || !relevance || !image) {
      return NextResponse.json({error: "Заполните обязательные поля"}, {status: 400});
    }

    const safeOrb: SpecialtyData["orb"] = VALID_ORBS.has(orb) ? orb : "cyan";

    const update = {
      id,
      code: String(code),
      title: String(title),
      description: String(description),
      relevance: String(relevance),
      curriculum: Array.isArray(curriculum) ? curriculum.map(String) : [],
      targetAudience: Array.isArray(targetAudience) ? targetAudience.map(String) : [],
      careers: Array.isArray(careers) ? careers.map(String) : [],
      image: String(image),
      icons: Array.isArray(icons) ? icons.map(String) : [],
      orb: safeOrb,
      budgetPlaces: Array.isArray(budgetPlaces) && budgetPlaces.length > 0
        ? budgetPlaces.map((e: {label: unknown; count: unknown}) => ({
            label: String(e.label ?? ""),
            count: Number(e.count) || 0,
          } satisfies BudgetPlaceEntry))
        : null,
    };

    const collection = await specialtiesCollection;
    await collection.updateOne({id}, {$set: update}, {upsert: true});

    return NextResponse.json({success: true, specialty: update});
  } catch {
    return NextResponse.json({error: "Ошибка сервера"}, {status: 500});
  }
}
