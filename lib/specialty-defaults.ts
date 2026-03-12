import {specialties} from "@/lib/guide-data";
import type {SpecialtyData} from "@/lib/types";

const specialtyConfig: Record<string, {
  src: string;
  icons: string[];
  orb: SpecialtyData["orb"];
}> = {
  web: {src: "/directions/portrait-male-3.png", icons: ["Code", "Globe", "LayoutTemplate", "Monitor"], orb: "cyan"},
  software: {src: "/directions/portrait-male-4.png", icons: ["Terminal", "Code2", "Layers", "Package"], orb: "aurora"},
  techsupport: {src: "/directions/portrait-male-2.png", icons: ["Wrench", "Monitor", "HardDrive", "Activity"], orb: "sunset"},
  ai: {src: "/directions/portrait-female-1.png", icons: ["BrainCircuit", "Sparkles", "Database", "TrendingUp"], orb: "cyan"},
  bim: {src: "/directions/portrait-male-5.png", icons: ["Building2", "Layers3", "PenTool", "Ruler"], orb: "neon"},
  telecomsecurity: {src: "/directions/portrait-male-1.png", icons: ["ShieldCheck", "Radio", "Lock", "Wifi"], orb: "aurora"},
  security: {src: "/directions/portrait-male-6.png", icons: ["Shield", "Lock", "Eye", "KeyRound"], orb: "neon"},
  gamedev: {src: "/directions/portrait-female-2.png", icons: ["Gamepad2", "Swords", "MonitorPlay", "Box"], orb: "aurora"},
  systems: {src: "/directions/portrait-female-3.png", icons: ["Cpu", "HardDrive", "Server", "MemoryStick"], orb: "sunset"},
  networks: {src: "/directions/portrait-female-4.png", icons: ["Network", "Wifi", "Cloud", "Router"], orb: "cyan"},
  intelligent: {src: "/directions/portrait-female-5.png", icons: ["Brain", "Zap", "Cog", "Bot"], orb: "aurora"},
  design: {src: "/directions/portrait-female-6.png", icons: ["Palette", "PenTool", "Figma", "Brush"], orb: "neon"},
  transport: {src: "/directions/portrait-female-7.png", icons: ["TramFront", "Building2", "Settings", "Gauge"], orb: "sunset"},
};

export const specialtyDefaults: SpecialtyData[] = specialties.map(s => ({
  id: s.id,
  code: s.code,
  title: s.title,
  description: s.description,
  relevance: s.relevance,
  curriculum: s.curriculum,
  targetAudience: s.targetAudience,
  careers: s.careers,
  image: specialtyConfig[s.id].src,
  icons: specialtyConfig[s.id].icons,
  orb: specialtyConfig[s.id].orb,
  budgetPlaces: null,
}));
