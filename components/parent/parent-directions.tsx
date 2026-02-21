import {specialties} from "@/lib/guide-data";
import SpecialtyCard from "@/components/parent/specialty-card";
import type {OrbAnimationProps} from "@/components/orb";

const specialtyConfig: Record<string, {
  src: string;
  align: "left" | "right";
  icons: string[];
  orb: OrbAnimationProps["preset"];
}> = {
  web: {src: "/portrait-student-1.png", align: "right", icons: ["Code", "Globe", "LayoutTemplate", "Monitor"], orb: "cyan"},
  security: {src: "/portrait-natural-1.png", align: "right", icons: ["Shield", "Lock", "Eye", "KeyRound"], orb: "neon"},
  gamedev: {src: "/portrait-student-2.png", align: "right", icons: ["Gamepad2", "Swords", "MonitorPlay", "Box"], orb: "aurora"},
  systems: {src: "/portrait-natural-2.png", align: "right", icons: ["Cpu", "HardDrive", "Server", "MemoryStick"], orb: "sunset"},
  networks: {src: "/portrait-female-1.png", align: "left", icons: ["Network", "Wifi", "Cloud", "Router"], orb: "cyan"},
  intelligent: {src: "/portrait-female-2.png", align: "left", icons: ["Brain", "Zap", "Cog", "Bot"], orb: "aurora"},
  design: {src: "/portrait-female-3.png", align: "left", icons: ["Palette", "PenTool", "Figma", "Brush"], orb: "neon"},
  transport: {src: "/portrait-student-1.png", align: "right", icons: ["TramFront", "Building2", "Settings", "Gauge"], orb: "sunset"},
};

export default function ParentDirections() {
  return (
    <section id="directions" className="mx-auto max-w-6xl px-10 py-20 sm:px-20">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Какое направление выбрать ребёнку?
        </h2>
        <p className="mx-auto max-w-3xl text-muted-foreground">
          8 востребованных IT-специальностей с трудоустройством в ведущие компании страны
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
