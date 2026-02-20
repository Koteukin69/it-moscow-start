import Image from "next/image";

const partners = [
  {name: "Яндекс", logo: "/partners/yandex.svg"},
  {name: "ВКонтакте", logo: "/partners/vk.svg"},
  {name: "МТС", logo: "/partners/mts.svg"},
  {name: "Сбер", logo: "/partners/sber.svg"},
  {name: "ВТБ", logo: "/partners/vtb.svg"},
  {name: "Kaspersky", logo: "/partners/kaspersky.svg"},
  {name: "Ростелеком", logo: "/partners/rostelecom.svg"},
  {name: "Т-Банк", logo: "/partners/tinkoff.svg"},
  {name: "Ozon", logo: "/partners/ozon.svg"},
  {name: "1С", logo: "/partners/onec.svg"},
];

export default function ParentPartners() {
  return (
    <section id="partners" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Партнёры — работодатели
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Наши выпускники проходят стажировки и получают офферы от ведущих
          IT-компаний страны
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="relative h-10 w-28 opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0 sm:h-12 sm:w-36"
          >
            <Image
              src={partner.logo}
              alt={partner.name}
              fill
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
