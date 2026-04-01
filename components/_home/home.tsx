import Header from "./blocks/header";
import Hero from "./blocks/hero";
import Transition from "./blocks/transition";
import Directions from "./blocks/directions";
import About from "./blocks/about";
import Courses from "./blocks/courses";


export default function Home() {
  return (<>
    <main className={"bg-white text-black"}>
      <Header/>
      <Hero/>
      <Transition className={"bg-white text-[#7B9EFF]"}/>
      <div id={"directions"} className={"bg-[#7B9EFF] text-white flex flex-col items-center px-5 sm:px-10 md:px-25 py-10 gap-20"}>
        <Directions/>
      </div>
      <Transition className={"bg-[#7B9EFF] text-[#3053B2]"}/>
      <div id={"about"} className={"bg-[#3053B2] text-white flex flex-col items-center px-5 sm:px-10 md:px-25 py-10 gap-20"}>
        <About/>
      </div>
      <div id={"courses"} className={"bg-[#3053B2] text-white flex flex-col items-center px-5 sm:px-10 md:px-25 py-10 gap-20"}>
        <Courses/>
      </div>
      <Transition className={"bg-[#3053B2] text-[#021750]"}/>
    </main>
  </>);
}