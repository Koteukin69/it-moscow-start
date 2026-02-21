import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Button} from "@/components/ui/button";
import Link from "next/link";

const faq = [
  {
    q: "С какого класса можно поступить?",
    a: "Поступить в IT.Москва можно после 9 класса. Обучение длится 3 года 10 месяцев и завершается получением диплома о среднем профессиональном образовании.",
  },
  {
    q: "Есть ли бюджетные места?",
    a: "Да, большинство мест — бюджетные. Зачисление проходит по среднему баллу аттестата. Также доступны коммерческие места для тех, кто не прошёл по конкурсу.",
  },
  {
    q: "Какие документы нужны для поступления?",
    a: "Аттестат об основном общем образовании (9 классов), паспорт, СНИЛС, 4 фотографии 3×4, медицинская справка 086/у. Подать документы можно через портал mos.ru или лично.",
  },
  {
    q: "Есть ли общежитие?",
    a: "Нет, колледж не предоставляет общежитие. Однако все площадки расположены в Москве с удобной транспортной доступностью.",
  },
  {
    q: "Можно ли совмещать учёбу с работой?",
    a: "Обучение проходит в очном формате, но начиная со старших курсов многие студенты успешно совмещают учёбу со стажировками и подработкой в IT-компаниях.",
  },
  {
    q: "Что такое it.coin?",
    a: "it.coin — это внутренняя валюта колледжа. Студенты зарабатывают монеты за активность, участие в мероприятиях и достижения, а тратят в магазине колледжа на мерч и курсы.",
  },
];

export default function ParentFaq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-10 py-20 sm:px-20">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Вопрос — ответ</h2>
        <p className="text-muted-foreground">Популярные вопросы</p>
      </div>

      <Accordion type="single" collapsible className="mb-8">
        {faq.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left text-base">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="text-center">
        <Button variant="outline" size="lg" asChild>
          <Link href="https://t.me/itmoscow" target="_blank">
            Другие вопросы
          </Link>
        </Button>
      </div>
    </section>
  );
}
