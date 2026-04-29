'use client';

import Title from "@/components/_home/components/title";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import Link from "next/link";
import {useRef, useState} from "react";

export default function Faq({faqItems}: {faqItems: { question: string; answer: string }[]}) {
  const [hidden, setHidden] = useState(true);
  const faqRef = useRef<HTMLDivElement>(null);

  function toggleHidden() {
    setHidden(!hidden);
    if (!hidden) {
      requestAnimationFrame(() => {
        faqRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }

  return (<>
    <section ref={faqRef}/>
    <Title
      title={"FAQ (Вопрос — ответ)"}
    />
    <div className={"flex flex-col items-center gap-10 w-full"}>
      <Accordion type="single" collapsible className="px-71px lg:px-[142px] w-full relative">
        {(hidden ? faqItems.slice(0, 4) : faqItems).map((item, i) => (
          <AccordionItem className="border-b-white/50" key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left text-base text-[24px] cursor-pointer">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-white/50 text-[20px] flex flex-col gap-2">
              {item.answer.split("\n").map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
        {hidden && <div className="pointer-events-none absolute bottom-0 h-[50%] inset-x-0 bg-gradient-to-b from-transparent to-[#18181B] z-1"/>}
      </Accordion>
      <button className={"bg-gray-800 hover:bg-gray-800/90 active:bg-gray-700 font-semibold text-[20px] px-10 py-5 rounded-full cursor-pointer"} onClick={toggleHidden} >{hidden ? "Показать ещё" : "Скрыть"}</button>
    </div>
    <p className={"text-[20px] text-center"}>Ещё остались вопросы? Заполните <Link className={"underline decoration-[1.5px] hover:decoration-[2px] active:opacity-50"} href={""}>форму</Link>, и мы вам перезвоним.</p>
  </>)
}