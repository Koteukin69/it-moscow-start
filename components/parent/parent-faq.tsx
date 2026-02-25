import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {applicantFaq} from "@/lib/faq";

export default function ParentFaq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-10 py-20 sm:px-20">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Вопрос — ответ</h2>
        <p className="text-muted-foreground">Популярные вопросы</p>
      </div>

      <Accordion type="single" collapsible className="mb-8">
        {applicantFaq.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left text-base">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
