import Title from "@/components/_home/components/title";
import {getFaq} from "@/lib/faq";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import Link from "next/link";

export default async function Faq() {
  const faqItems = await getFaq();

  return (<>
    <Title
      title={"FAQ (Вопрос — ответ)"}
    />
    <Accordion type="single" collapsible className="px-71px lg:px-[142px]">
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
    <p>Ещё остались вопросы? Заполните <Link className={"hover:underline"} href={""}>форму</Link>, и мы вам перезвоним.</p>
  </>)
}