import Title from "@/components/_home/components/title";
import Image from "next/image"

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

export default function Partners() {
  return (<>
    <Title
      title={"Партнёры — работодатели"}
      description={"Наши выпускники проходят стажировки и получают офферы от ведущих IT-компаний страны"}
    />
    <div className={"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-10 w-full px-10 sm:px-[71px] lg:px-[142px]"}>
      {partners.map((partner, i) => (
        <div className={"w-full aspect-square relative [@media(hover:hover)]:opacity-70 transition-all hover:opacity-100 hover:grayscale-0 w-25"} key={i}>
          <Image src={partner.logo} alt={partner.name} fill />
        </div>
      ))}
    </div>
  </>);
}