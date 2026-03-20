'use client';

import {useState, useEffect} from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface PopupSettings {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  buttonUrl: string;
}

export default function ConsultationBannerCard() {
  const [settings, setSettings] = useState<PopupSettings>();

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

  return settings ? (
    <div className="relative rounded-2xl overflow-hidden bg-card border md:min-h-[180px] max-w-md w-full">

      <div
        className="absolute top-0 right-0 bottom-0"
        style={{left: "55%", zIndex: 1}}
      >
        <Image
          src={settings.image}
          alt="Специалист приёмной комиссии"
          fill
          className="object-cover object-top"
        />
      </div>

      <div className="relative flex md:min-h-[180px]" style={{zIndex: 10}}>
        <div className="flex flex-col gap-2 p-4 w-[55%] bg-card justify-between">

          <div className="flex flex-col gap-1">
            <p className="font-semibold leading-snug">
              {settings.title}
            </p>
            {settings.subtitle && (
              <p className="text-xs text-muted-foreground">
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
  ) : <div className="relative rounded-2xl overflow-hidden bg-card border md:min-h-[180px] max-w-md w-full">
    <div
      className="absolute top-0 right-0 bottom-0"
      style={{left: "55%", zIndex: 1}}
    >
      <Skeleton className={"w-full h-full rounded-sm"} />
    </div>

    <div className="relative flex md:min-h-[180px]" style={{zIndex: 10}}>
      <div className="flex flex-col gap-2 p-4 w-[55%] bg-card justify-between">

        <div className="flex flex-col gap-1">
          <Skeleton className={"w-[40%] h-6 rounded-full"} />
          <Skeleton className={"w-full h-4 rounded-full"} />
        </div>

        <Skeleton className={"w-full h-8 rounded-full"} />

        <Skeleton
          className="h-8 w-24 rounded-full"
        />

      </div>
    </div>
  </div>;
}
