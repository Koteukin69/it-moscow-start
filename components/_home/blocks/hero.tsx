import Image from "next/image";
import Button from "../components/button"
import Title from "../components/title";

import Matrix from "./matrix"

export default function Hero() {
  return (<div className={"h-[calc(100dvh-256px)] mt-32 flex flex-col justify-center items-center gap-17.5"}>
    <Image src={"/name.svg"} alt={"name badge"} width={134} height={40}/>
    <Title className={"max-w-200 text-center px-10 text-[#3053B1]"} title={"МОСКВА ЖДЁТ ТВОЙ ДЕПЛОЙ!"}/>
    <div className={"flex gap-2.5"}>
      <Button text={"Я Студент"} href={"https://lk.itmoscow.pro"}/>
      <Button text={"Я Абитуриент"} href={"/applicant"}/>
    </div>
    <Matrix
      bgColor={"white"}
      brightColor={"lightblue"}
      glowColor={"transparent"}
      dimColor={"#3053B180"}
    />
  </div>)
}
