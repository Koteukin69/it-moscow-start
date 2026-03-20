'use client';

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {useParentToken} from "@/components/parent/parent-token-provider";

interface FaqItem {
  question: string;
  answer: string;
}

export default function ParentFaq({faqItems}: {faqItems: FaqItem[]}) {
  const {token, loading} = useParentToken();

  if (loading || !token) return null;

  return (
    <section id="faq" className="mx-auto max-w-3xl px-10 py-20 sm:px-20">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Вопрос — ответ</h2>
        <p className="text-muted-foreground">Популярные вопросы</p>
      </div>

      <Accordion type="single" collapsible className="mb-8">
        {faqItems.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left text-base">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer.split("\n").map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
