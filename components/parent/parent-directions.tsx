import {specialties} from "@/lib/guide-data";
import SpecialtyCard from "@/components/parent/specialty-card";
import type {OrbAnimationProps} from "@/components/orb";

const specialtyConfig: Record<string, {
  src: string;
  align: "right" | "right";
  icons: string[];
  orb: OrbAnimationProps["preset"];
}> = {
  web: {src: "/directions/portrait-male-3.png", align: "right", icons: ["Code", "Globe", "LayoutTemplate", "Monitor"], orb: "cyan"},
  software: {src: "/directions/portrait-male-4.png", align: "right", icons: ["Terminal", "Code2", "Layers", "Package"], orb: "aurora"},
  techsupport: {src: "/directions/portrait-male-2.png", align: "right", icons: ["Wrench", "Monitor", "HardDrive", "Activity"], orb: "sunset"},
  ai: {src: "/directions/portrait-female-1.png", align: "right", icons: ["BrainCircuit", "Sparkles", "Database", "TrendingUp"], orb: "cyan"},
  bim: {src: "/directions/portrait-male-5.png", align: "right", icons: ["Building2", "Layers3", "PenTool", "Ruler"], orb: "neon"},
  telecomsecurity: {src: "/directions/portrait-male-1.png", align: "right", icons: ["ShieldCheck", "Radio", "Lock", "Wifi"], orb: "aurora"},
  security: {src: "/directions/portrait-male-6.png", align: "right", icons: ["Shield", "Lock", "Eye", "KeyRound"], orb: "neon"},
  gamedev: {src: "/directions/portrait-female-2.png", align: "right", icons: ["Gamepad2", "Swords", "MonitorPlay", "Box"], orb: "aurora"},
  systems: {src: "/directions/portrait-female-3.png", align: "right", icons: ["Cpu", "HardDrive", "Server", "MemoryStick"], orb: "sunset"},
  networks: {src: "/directions/portrait-female-4.png", align: "right", icons: ["Network", "Wifi", "Cloud", "Router"], orb: "cyan"},
  intelligent: {src: "/directions/portrait-female-5.png", align: "right", icons: ["Brain", "Zap", "Cog", "Bot"], orb: "aurora"},
  design: {src: "/directions/portrait-female-6.png", align: "right", icons: ["Palette", "PenTool", "Figma", "Brush"], orb: "neon"},
  transport: {src: "/directions/portrait-female-7.png", align: "right", icons: ["TramFront", "Building2", "Settings", "Gauge"], orb: "sunset"},
};

export default function ParentDirections() {
  return (
    <section id="directions" className="mx-auto max-w-6xl px-10 py-20 sm:px-20">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Какое направление выбрать ребёнку?
        </h2>
        <p className="mx-auto max-w-3xl text-muted-foreground">
          13 востребованных специальностей с трудоустройством в ведущие компании страны
        </p>
      </div>

      <div className="grid justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {specialties.map((specialty) => {
          const config = specialtyConfig[specialty.id];
          return (
            <SpecialtyCard
              key={specialty.id}
              specialty={specialty}
              image={config.src}
              imageAlign={config.align}
              iconNames={config.icons}
              orbPreset={config.orb}
            />
          );
        })}
      </div>
    </section>
  );
}
