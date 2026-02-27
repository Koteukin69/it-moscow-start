import Image from "next/image";

const partners = [
  {name: "1С", logo: "/partners/1c.png"},
  {name: "Yandex", logo: "/partners/yandex.svg"},
  {name: "VK", logo: "/partners/vk.svg"},
  {name: "VTB", logo: "/partners/vtb.svg"},
  {name: "Kaspersky", logo: "/partners/kaspersky.svg"},
  {name: "MTC", logo: "/partners/mtc.svg"},
  {name: "Ozon", logo: "/partners/ozon.svg"},
  {name: "Sberbank", logo: "/partners/sberbank.png"},
];

export default function ParentPartners() {
  return (
    <section id="partners" className="mx-auto max-w-6xl px-10 py-20 sm:px-20">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Партнёры — работодатели
        </h2>
        <p className="mx-auto max-w-3xl text-muted-foreground">
          Наши выпускники проходят стажировки и получают офферы от ведущих
          IT-компаний страны
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 w-fit justify-self-center justify-center gap-12 md:gap-20">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="relative aspect-square [@media(hover:hover)]:opacity-70 transition-all hover:opacity-100 hover:grayscale-0 w-25"
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
