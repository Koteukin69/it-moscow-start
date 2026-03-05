'use client';

import {useState, useEffect} from "react";
import Image from "next/image";

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

function loadSettings(callback: () => void, onData?: (s: PopupSettings) => void) {
  fetch(`/api/popup?_=${Date.now()}`, {cache: "no-store"})
    .then(r => r.json())
    .then(data => {
      if (data.title) onData?.(data);
    })
    .catch(() => {})
    .finally(callback);
}

export default function ParentConsultationBanner() {
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState<PopupSettings>(DEFAULT_SETTINGS);

  function close() {
    setVisible(false);
    setTimeout(() => {
      loadSettings(() => setVisible(true), setSettings);
    }, 2 * 60 * 1000);
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    loadSettings(
      () => { timer = setTimeout(() => setVisible(true), 10 * 1000); },
      setSettings,
    );

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden bg-background lg:min-h-[360px]">

        {/* Desktop image — right side, absolutely positioned */}
        <div
          className="absolute top-0 right-0 bottom-0 hidden lg:block"
          style={{left: '55%', zIndex: 1}}
        >
          <Image
            src={settings.image}
            alt="Специалист приёмной комиссии"
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        {/* Mobile image — square, top of popup, in normal flow */}
        <div className="block lg:hidden w-full aspect-square relative">
          <Image
            src={settings.image}
            alt="Специалист приёмной комиссии"
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        {/* Content */}
        <div className="relative flex lg:min-h-[360px]" style={{zIndex: 10}}>
          <div className="flex flex-col gap-5 px-8 py-8 w-full lg:w-[55%] bg-background lg:justify-between">

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

            {/* FAQ link — desktop only */}
            <div className="hidden lg:flex items-center gap-3">
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
    </div>
  );
}
