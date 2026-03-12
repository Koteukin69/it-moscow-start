import {specialtyDefaults} from "@/lib/specialty-defaults";
import type {SpecialtyData} from "@/lib/types";

type DbSpecialty = {
  id: string;
  code: string;
  title: string;
  description: string;
  relevance: string;
  curriculum: string[];
  targetAudience: string[];
  careers: string[];
  image: string;
  icons: string[];
  orb: string;
  budgetPlaces: number | null;
};

export function mergeWithDefaults(dbDocs: DbSpecialty[]): SpecialtyData[] {
  const dbMap = new Map(dbDocs.map(d => [d.id, d]));
  return specialtyDefaults.map(def => {
    const db = dbMap.get(def.id);
    if (!db) return def;
    return {
      id: db.id,
      code: db.code,
      title: db.title,
      description: db.description,
      relevance: db.relevance,
      curriculum: db.curriculum,
      targetAudience: db.targetAudience,
      careers: db.careers,
      image: db.image,
      icons: db.icons,
      orb: db.orb as SpecialtyData["orb"],
      budgetPlaces: db.budgetPlaces,
    };
  });
}
