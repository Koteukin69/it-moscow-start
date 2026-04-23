import Header from "./blocks/header";
import Hero from "./blocks/hero";
import Transition from "./blocks/transition";
import Directions from "./blocks/directions";
import About from "./blocks/about";
import Courses from "./blocks/courses";
import Banner from "./blocks/banner";
import Earning from "./blocks/earning";
import Partners from "@/components/_home/blocks/partners";
import Footer from "@/components/_home/blocks/footer";
import News from "@/components/_home/blocks/news";
import CommissionBanner from "@/components/_home/blocks/commission-banner";
import Orb from "@/components/orb";
import {TechnologiesCarousel} from "@/components/_home/blocks/technologies-carousel";
import ShowcasePanel from "@/components/_home/blocks/showcase-panel";
import Faq from "@/components/_home/blocks/faq";

export default function Home() {
  return (<>
    <main className={"text-black"}>
      <Header/>
      <Hero/>
      <Transition className={"bg-transparent text-[#7B9EFF]"}/>
      <div id={"directions"} className={"bg-[#7B9EFF] text-white flex flex-col items-center px-5 sm:px-10 lg:px-25 py-10 gap-20"}>
        <Directions/>
      </div>
      <Transition className={"bg-[#7B9EFF] text-black"}/>
      <div id={"about"} className={"bg-black text-white flex flex-col items-center px-5 sm:px-10 md:px-25 py-10 gap-20"}>
        <About/>
      </div>
      <div id={"about"} className={"bg-black text-white flex flex-col items-center px-5 sm:px-10 md:px-30 lg:px-50 py-10 gap-20"}>
        <ShowcasePanel
          title="МЕРЧ IT.Москва"
          color={"pink"}
        />
        <ShowcasePanel
          title="ФУД-Заряд"
          color={"lightblue"}
        />
      </div>
      <div id={"tech"} className={"bg-black text-white flex flex-col items-center w-full px-10 md:px-0 py-10 gap-20 overflow-x-hidden"}>
        <TechnologiesCarousel cards={[
          {
            id: "alice-ai",
            name: "Поиск с Алисой AI",
            description:
              "Ты спрашиваешь — Поиск с Алисой AI понимает. Алиса AI анализирует сотни миллиардов страниц за доли секунды и даёт осмысленные полезные ответы. Сочетание лучших поисковых технологий и искусственного интеллекта — так работает сервис, которому каждый месяц доверяют 100 миллионов человек по всей стране.",
            image: {
              src: "https://yandex.ru/youngcon/static/images/2026/tech/list/search_active.png",
              alt: "Интерфейс Поиска с Алисой AI на смартфоне",
            },
            color: "#FF5A3C",
          },
          {
            id: "alice-devices",
            name: "Алиса AI и умные устройства",
            description:
              "Алиса живёт в смартфонах, колонках и автомобилях. Управляй умным домом голосом, слушай музыку и получай ответы на любые вопросы.",
            image: {
              src: "https://yandex.ru/youngcon/static/images/2026/tech/list/alisa_active.png",
              alt: "Умная колонка с Алисой",
            },
            color: "#3B3B3B",
          },
          {
            id: "autonomous",
            name: "Автономный транспорт и роботы",
            description:
              "Роботы-доставщики и беспилотные автомобили Яндекса уже работают на улицах городов. Это технологии, которые меняют логистику.",
            image: {
              src: "https://yandex.ru/youngcon/static/images/2026/tech/list/at_active-full_3000_crossfade_q60.webp",
              alt: "Робот-доставщик Яндекса",
            },
            color: "#2D7FF9",
          },
          {
            id: "scooters",
            name: "Самокаты Яндекс Go",
            description:
              "В наши самокаты вложена душа инженеров Яндекса. Это полностью наша разработка: они умные, манёвренные и удобные для города.",
            image: {
              src: "/technologies/scooter.png",
              alt: "Самокат Яндекс Go",
            },
            color: "#FFD60A",
          },
          {
            id: "drive",
            name: "Яндекс Драйв",
            description:
              "Драйв — технологичный каршеринг, доступный даже начинающим водителям. На Young Con автомобили Драйва станут шаттлами в будущее, в которых можно будет пройти пробное собеседование и начать свой путь в Яндексе.",
            image: {
              src: "/technologies/drive.png",
              alt: "Автомобиль Яндекс Драйв",
            },
            color: "#6A5BFF",
          },
          {
            id: "infrastructure",
            name: "Yandex Infrastructure",
            description:
              "Облачная инфраструктура, на которой работают все сервисы Яндекса и тысячи внешних компаний. Масштаб, скорость и надёжность.",
            image: {
              src: "/technologies/infrastructure.png",
              alt: "Серверная инфраструктура Яндекса",
            },
            color: "#1A1033",
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
      <div id={"courses"} className={"bg-black text-white flex flex-col items-center px-5 sm:px-10 md:px-25 py-10 gap-20"}>
        <Courses/>
      </div>
      <div id={"faq"} className={"bg-black text-white flex flex-col items-center px-5 sm:px-10 md:px-25 py-10 gap-20"}>
        <Faq/>
      </div>
      <Transition className={"bg-black text-[#7B9EFF]"}/>
      <div className={"bg-[#7B9EFF] text-white flex flex-col items-center px-5 sm:px-10 md:px-25 py-10 gap-20"}>
        <Earning/>
      </div>
      <div className={"bg-[#7B9EFF] text-white flex flex-col items-center px-5 sm:px-10 md:px-30 lg:px-50 py-10 gap-20"}>
        <CommissionBanner
          title={"День открытых дверей"}
          subtitle={"Приходи!"}
          links={[
            {name: "Записаться", href: "https://t.me/"},
          ]}
        />
      </div>
      <div className={"bg-[#7B9EFF] text-white flex flex-col items-center  r px-5 sm:px-10 md:px-25 py-10 gap-20 overflow-hidden"}>
        <Partners/>
      </div>
      <div className={"bg-[#7B9EFF] text-white flex flex-col items-center px-5 sm:px-10 md:px-25 py-10 gap-20"}>
        <News/>
      </div>

      <Transition className={"bg-[#7B9EFF] text-black"}/>
      <Footer/>
    </main>
    <a href={"/applicant"} className={"fixed"}>
      <div className={"fixed bottom-10 right-10 w-16 h-16 rounded-full glass z-1"}>
        <Orb className={"overflow-visible"}
             resolution ={4}
        />
      </div>
      <div className={"fixed bottom-22 right-20 bg-white/50 text-black z-2 glass px-4 p-2 rounded-lg rounded-br-xs text-right"}>
        Я готов ответить на все твои вопросы
      </div>
    </a>
  </>);
}