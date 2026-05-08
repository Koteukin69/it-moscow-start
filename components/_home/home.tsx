import Header from "./blocks/header";
import Hero from "./blocks/hero";
import Transition from "./blocks/transition";
import Directions from "./blocks/directions";
import About from "./blocks/about";
import Courses from "./blocks/courses";
import Earning from "./blocks/earning";
import Partners from "@/components/_home/blocks/partners";
import Footer from "@/components/_home/blocks/footer";
import News from "@/components/_home/blocks/news";
import {TechnologiesCarousel} from "@/components/_home/blocks/technologies-carousel";
import ShowcasePanel from "@/components/_home/blocks/showcase-panel";
import Faq from "@/components/_home/blocks/faq";

import {directionsCollection} from "@/lib/db/collections";
import {getFaq} from "@/lib/faq";
import Events from "@/components/_home/blocks/events";

export default async function Home() {
  const collection = await directionsCollection;
  const directions = await collection.find({}).toArray();

  return (<>
    <main className={"text-black"}>
      <Header/>
      <Hero/>
      <div id={"directions"} className={"bg-[#7B9EFF] text-white flex flex-col items-center px-5 sm:px-10 lg:px-25 py-10 gap-20 relative"}>
        <Directions directions={directions.map(({_id, ...direction}) => direction)}/>
      </div>
      <Transition className={"bg-[#7B9EFF] text-[#18181B]"}/>
      <div id={"about"} className={"bg-[#18181B] text-white flex flex-col items-center px-5 sm:px-10 md:px-25 py-10 gap-20"}>
        <About/>
      </div>
      <div id={"about"} className={"bg-[#18181B] text-white flex flex-col items-center px-5 sm:px-10 md:px-30 lg:px-50 py-10 gap-20"}>
        <ShowcasePanel
          title="МЕРЧ IT.Москва"
          color={"lightblue"}
          image={{src: "/merch-showcase.png", alt: "merch"}}
        />
        <ShowcasePanel
          title="Марочкина Баффет"
          color={"pink"}
          image={{src: "/buffet-showcase.png", alt: "buffet"}}
        />
      </div>
      <div id={"tech"} className={"bg-[#18181B] text-white flex flex-col items-center w-full px-10 md:px-0 py-10 gap-20 overflow-x-hidden"}>
        <TechnologiesCarousel cards={[
          {
            id: "it",
            name: "ИТ.Москва",
            description:
              "Новый флагман Москвы",
            image: {
              src: "/technologies/it.png",
              alt: "Интерфейс Поиска с Алисой AI на смартфоне",
            },
            color: "#FF5A3C",
          },
          {
            id: "ya-prac",
            name: "Я.Практикум",
            description:
              "Вместе с Я.Практикум",
            image: {
              src: "/partners/yandex.svg",
              alt: "Яндекс",
            },
            color: "#d6a60A",
          },
          {
            id: "vk-edu",
            name: "VK Education",
            description:
              "Бесплатные курсы от IT-гигантов",
            image: {
              src: "/partners/vk.svg",
              alt: "VK",
            },
            color: "#2D7FF9",
          },
          {
            id: "tech",
            name: "Технологии",
            description:
              "Современные технологии теперь везде",
            image: {
              src: "/technologies/tech.png",
              alt: "Технологии",
            },
            color: "gray",
          },
          {
            id: "buildings",
            name: "Корпуса",
            description:
              "Много разных современных строений",
            image: {
              src: "/technologies/corp.png",
              alt: "Корпуса",
            },
            color: "#6A5BFF",
          },
          {
            id: "ai",
            name: "Ассистент",
            description:
              "Помощь при поступлении от ИИ",
            image: {
              src: "/technologies/asist.png",
              alt: "Асистент IT.Москвы",
            },
            color: "#a686ba",
          },
        ]}/>
      </div>
      {/*<div className={"bg-black text-white flex flex-col items-center px-5 sm:px-10 md:px-30 lg:px-50 py-10 gap-20"}>
        <Banner
          title={"Поступи в IT.Москва"}
          subtitle={"Мы подготовили для наших абитуриентов самый интересный и актуальный контент от преподавателей. Мастер-классы, онлайн-уроки, лайфхаки и важные напоминания в период поступления — всё, чтобы помочь сделать правильный выбор профессии."}
          links={[
            {name: "Telegram", href: "https://t.me/"},
            {name: "ВКонтакте", href: "https://vk.ru/itmoscowprivet"},
          ]}
        />
      </div>*/}
      <div id={"courses"} className={"bg-[#18181B] text-white flex flex-col items-center px-5 sm:px-10 md:px-25 py-10 gap-20"}>
        <Courses/>
      </div>
      <div id={"faq"} className={"bg-[#18181B] text-white flex flex-col items-center px-5 sm:px-10 md:px-25 py-10 gap-20"}>
        <Faq faqItems={await getFaq()}/>
      </div>
      <Transition className={"bg-[#18181B] text-[#7B9EFF]"}/>
      <div className={"bg-[#7B9EFF] text-white flex flex-col items-center px-5 sm:px-10 md:px-25 py-10 gap-20"}>
        <Earning/>
      </div>
      <div className={"bg-[#7B9EFF] text-white flex flex-col items-center px-5 sm:px-10 md:px-20 lg:px-30 py-10 gap-20"}>
        <Events/>
      </div>
      <div className={"bg-[#7B9EFF] text-white flex flex-col items-center  r px-5 sm:px-10 md:px-25 py-10 gap-20 overflow-hidden  "}>
        <Partners/>
      </div>
      <div className={"bg-[#7B9EFF] text-white flex flex-col items-center px-5 sm:px-10 md:px-25 py-10 gap-20"}>
        <News/>
      </div>

      <Transition className={"bg-[#7B9EFF] text-black"}/>
      <Footer/>
    </main>
    {/*<a href={"/applicant"} className={"fixed"}>
      <div className={"fixed bottom-10 right-10 w-16 h-16 rounded-full glass z-1"}>
        <Orb className={"overflow-visible"}
             resolution ={4}
        />
      </div>
      <div className={"fixed bottom-22 right-20 bg-white/50 text-black z-2 glass px-4 p-2 rounded-lg rounded-br-xs text-right"}>
        Я готов ответить на все твои вопросы
      </div>
    </a>*/}
  </>);
}