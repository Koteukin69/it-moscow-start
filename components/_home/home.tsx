import Header from "./blocks/header";
import Hero from "./blocks/hero";
import Transition from "./blocks/transition";
import Directions from "./blocks/directions";
import About from "./blocks/about";
import Courses from "./blocks/courses";
import Banner from "@/components/_home/blocks/banner";


export default function Home() {
  return (<>
    <main className={"bg-white text-black"}>
      <Header/>
      <Hero/>
      <Transition className={"bg-white text-[#7B9EFF]"}/>
      <div id={"directions"} className={"bg-[#7B9EFF] text-white flex flex-col items-center px-5 sm:px-10 lg:px-25 py-10 gap-20"}>
        <Directions/>
      </div>
      <Transition className={"bg-[#7B9EFF] text-[#3053B2]"}/>
      <div id={"about"} className={"bg-[#3053B2] text-white flex flex-col items-center px-5 sm:px-10 md:px-25 py-10 gap-20"}>
        <About/>
      </div>
      <div className={"bg-[#3053B2] text-white flex flex-col items-center px-5 sm:px-10 md:px-50 py-10 gap-20"}>
        <Banner
          title={"Поступи в IT.Москва"}
          subtitle={"Мы подготовили для наших абитуриентов самый интересный и актуальный контент от преподавателей. Мастер-классы, онлайн-уроки, лайфхаки и важные напоминания в период поступления — всё, чтобы помочь сделать правильный выбор профессии."}
          links={[
            {name: "Telegram", href: ""},
            {name: "ВКонтакте", href: ""},
          ]}

        />
      </div>
      <div id={"courses"} className={"bg-[#3053B2] text-white flex flex-col items-center px-5 sm:px-10 md:px-25 py-10 gap-20"}>
        <Courses/>
      </div>
      <Transition className={"bg-[#3053B2] text-[#021750]"}/>
    </main>
  </>);
}