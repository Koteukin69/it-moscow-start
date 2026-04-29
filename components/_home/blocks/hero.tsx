'use client';

import Image from "next/image";
import {ButtonLink} from "../components/buttonLink"
import {ArrowDown} from "lucide-react";
import Link from "next/link";
import Matrix from "@/components/_home/blocks/matrix";

export default function Hero() {
  return (<>
    <div className={"hidden md:flex h-[100dvh] flex-col justify-center items-center gap-[50dvh] relative"}>
      <h1 className={"text-center px-10 text-[#7B9EFF] text-[48px] font-bold"}>МОСКВА ЖДЁТ ТВОЙ ДЕПЛОЙ!</h1>
      <div className={"flex gap-2.5 z-1 relative top-20"}>
        <ButtonLink text={"Я Студент"} href={"https://lk.itmoscow.pro"}/>
        <ButtonLink text={"Я Абитуриент"} href={"/abit"}/>
      </div>
      <Image src={"/hero-bg.png"} alt={"hero"} fill/>
      <Matrix
        bgColor={"white"}
        brightColor={"lightblue"}
        glowColor={"transparent"}
        dimColor={"#3053B180"}
      />
    </div>

    <div className={"md:hidden h-[100dvh] bg-white relative flex flex-col pt-[20dvh] [@media(max-height:600px)]:pt-0"}>
      <div className={"absolute inset-0 flex flex-col items-center gap-2.5 z-1 pt-[15dvh] [@media(max-height:600px)]:hidden"}>
        <ButtonLink text={"Я Студент"} href={"https://lk.itmoscow.pro"}/>
        <ButtonLink text={"Я Абитуриент"} href={"/abit"}/>
      </div>
      <div className={"min-h-0 flex-1 relative"}>
        <Image src={"/hero-bg-mobile.svg"} alt={"hero-mobile"} fill/>
      </div>
      <div className={"flex flex-col items-center bg-[#7B9EFF] py-10 px-12.5 gap-10"}>
        <h1 className={"text-center text-white text-[20px] font-regular"}>Москва ждёт твой деплой!</h1>
        <ButtonLink className={"bg-white text-[#7B9EFF]! font-semibold w-full"} text={"Узнать направления"} href={"#directions"}/>
        <Link href={"#hero"}>
          <ArrowDown className={"text-white"}/>
        </Link>
      </div>
    </div>
    <section id={"hero"}/>
  </>);
}
