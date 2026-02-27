'use client';

import {useState, useEffect} from "react";
import Image from "next/image";

export default function ParentConsultationBanner() {
  const [visible, setVisible] = useState(false);

  function close() {
    setVisible(false);
    setTimeout(() => setVisible(true), 2 * 60 * 1000);
  }

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10 * 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div
        className="relative w-full max-w-3xl rounded-2xl overflow-hidden bg-background"
        style={{minHeight: 280}}
      >

        <div
          className="absolute top-0 right-0 bottom-0 hidden lg:block"
          style={{left: '58%', zIndex: 1}}
        >
          <Image
            src="/popup.png"
            alt="Специалист приёмной комиссии"
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        <div className="absolute inset-0 bg-[#111] lg:hidden" style={{zIndex: 3}}/>

        <div className="relative flex" style={{minHeight: 280, zIndex: 10}}>
          <div className="flex flex-col justify-between gap-5 px-8 py-8 w-full lg:w-[52%]">

            <div className="flex flex-col gap-1">
              <h2 className="text-xl lg:text-3xl font-extrabold text-white leading-tight">
                Задай вопрос
              </h2>
              <p className="text-sm lg:text-base font-semibold text-white/90">
                специалисту приёмной комиссии
              </p>
            </div>

            <p className="md text-white/70 leading-snug">
              Запишитесь на бесплатную консультацию<br/>
              и узнайте все о поступлении
            </p>

            <div className="flex gap-3 flex-wrap">
              <a
                href="#consultation"
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
    </div>
  );
}
