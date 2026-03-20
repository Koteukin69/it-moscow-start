'use client';

import {useState, useEffect} from "react";
import Image from "next/image";

interface PopupSettings {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  buttonUrl: string;
  delaySeconds: number;
  repeatDelaySeconds: number;
}

const DEFAULT_DELAY_SECONDS = 10;
const DEFAULT_REPEAT_DELAY_SECONDS = 120;

const DEFAULT_SETTINGS: PopupSettings = {
  image: "/popup.png",
  title: "Задай вопрос",
  subtitle: "специалисту приёмной комиссии",
  description: "Запишитесь на бесплатную консультацию\nи узнайте все о поступлении",
  buttonUrl: "#consultation",
  delaySeconds: DEFAULT_DELAY_SECONDS,
  repeatDelaySeconds: DEFAULT_REPEAT_DELAY_SECONDS,
};

async function fetchPopupSettings(): Promise<PopupSettings> {
  const r = await fetch(`/api/popup?_=${Date.now()}`, {cache: "no-store"});
  return r.json();
}

export default function ParentConsultationBanner() {
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState<PopupSettings>(DEFAULT_SETTINGS);

  function close() {
    setVisible(false);
    fetchPopupSettings()
      .then(data => {
        if (data.title) setSettings(data);
        setTimeout(() => setVisible(true), (data.repeatDelaySeconds ?? DEFAULT_REPEAT_DELAY_SECONDS) * 1000);
      })
      .catch(() => {
        setTimeout(() => setVisible(true), DEFAULT_REPEAT_DELAY_SECONDS * 1000);
      });
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    fetchPopupSettings()
      .then(data => {
        if (data.title) setSettings(data);
        timer = setTimeout(() => setVisible(true), (data.delaySeconds ?? DEFAULT_DELAY_SECONDS) * 1000);
      })
      .catch(() => {
        timer = setTimeout(() => setVisible(true), DEFAULT_DELAY_SECONDS * 1000);
      });

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden bg-background flex flex-row min-h-[280px]">

        {/* Image — left side */}
        <div className="relative w-2/5 shrink-0">
          <Image
            src={settings.image}
            alt="Специалист приёмной комиссии"
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        {/* Content — right side */}
        <div className="flex flex-col gap-5 px-6 py-6 flex-1 justify-between bg-background">

          <div className="flex flex-col gap-1">
            <h2 className="text-xl lg:text-3xl font-extrabold text-white leading-tight">
              {settings.title}
            </h2>
            {settings.subtitle && (
              <p className="text-sm lg:text-base font-semibold text-white/90">
                {settings.subtitle}
              </p>
            )}
          </div>

          <p className="text-white/70 leading-snug whitespace-pre-line">
            {settings.description}
          </p>

          <div className="flex gap-3 flex-wrap">
            <a
              href={settings.buttonUrl || "#consultation"}
              onClick={close}
              className="inline-flex items-center justify-center rounded-full bg-white text-black font-semibold text-sm lg:text-lg px-6 py-2.5 transition-opacity hover:opacity-90 shadow-[-100px_0px_0px_0px_#ffffff20]"
            >
              Записаться
            </a>
            <button
              onClick={close}
              className="inline-flex items-center justify-center rounded-full border border-white/40 text-white font-semibold text-sm lg:text-lg px-6 py-2.5 transition-colors hover:bg-white/10"
            >
              Закрыть
            </button>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs text-white/40 leading-snug">
              Так же вы можете прочитать раздел FAQ,<br/>
              там есть ответы на популярные вопросы
            </p>
            <a
              href="#faq"
              onClick={close}
              className="inline-flex items-center justify-center rounded-full border border-white/25 text-white/60 text-xs font-medium px-4 py-1.5 whitespace-nowrap transition-colors hover:bg-white/10"
            >
              Перейти
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
