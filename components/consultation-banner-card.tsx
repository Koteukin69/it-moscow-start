'use client';

import {useState, useEffect} from "react";
import Image from "next/image";
import Link from "next/link";

interface PopupSettings {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  buttonUrl: string;
}

const DEFAULT_SETTINGS: PopupSettings = {
  image: "/popup.png",
  title: "Задай вопрос",
  subtitle: "специалисту приёмной комиссии",
  description: "Запишитесь на бесплатную консультацию\nи узнайте все о поступлении",
  buttonUrl: "#consultation",
};

export default function ConsultationBannerCard() {
  const [settings, setSettings] = useState<PopupSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetch(`/api/popup?_=${Date.now()}`, {cache: "no-store"})
      .then(r => r.json())
      .then((data: PopupSettings) => {
        if (data.title) setSettings(data);
      })
      .catch((err: unknown) => {
        console.error("Failed to fetch popup settings:", err);
      });
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-card border md:min-h-[180px] flex-1">

      {/* Desktop: image absolutely on right side */}
      <div
        className="absolute top-0 right-0 bottom-0 hidden md:block"
        style={{left: "55%", zIndex: 1}}
      >
        <Image
          src={settings.image}
          alt="Специалист приёмной комиссии"
          fill
          className="object-cover object-top"
        />
      </div>

      {/* Mobile: image on top, square */}
      <div className="block md:hidden w-full aspect-square relative">
        <Image
          src={settings.image}
          alt="Специалист приёмной комиссии"
          fill
          className="object-cover object-top"
        />
      </div>

      {/* Content */}
      <div className="relative flex md:min-h-[180px]" style={{zIndex: 10}}>
        <div className="flex flex-col gap-3 px-4 py-4 w-full md:w-[55%] bg-card justify-between">

          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-extrabold text-white leading-tight">
              {settings.title}
            </h3>
            {settings.subtitle && (
              <p className="text-xs font-semibold text-white/90">
                {settings.subtitle}
              </p>
            )}
          </div>

          <p className="text-white/70 text-xs leading-snug whitespace-pre-line">
            {settings.description}
          </p>

          <Link
            href={settings.buttonUrl || "#consultation"}
            className="inline-flex items-center justify-center rounded-full bg-white text-black font-semibold text-xs px-4 py-2 transition-opacity hover:opacity-90 w-fit"
          >
            Записаться
          </Link>

        </div>
      </div>

    </div>
  );
}
