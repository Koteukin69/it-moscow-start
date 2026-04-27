import Image from "next/image";
import Button from "../components/button"

export default function Hero() {
  return (<>
    <div className={"hidden md:flex h-[100dvh] flex-col justify-center items-center gap-[50dvh] relative bg-white"}>
      <h1 className={"text-center px-10 text-[#7B9EFF] text-[48px] font-bold"}>МОСКВА ЖДЁТ ТВОЙ ДЕПЛОЙ!</h1>
      <div className={"flex gap-2.5 z-1 relative top-20"}>
        <Button text={"Я Студент"} href={"https://lk.itmoscow.pro"}/>
        <Button text={"Я Абитуриент"} href={"/applicant"}/>
      </div>
      <Image src={"/hero-bg.png"} alt={"hero"} fill/>
    </div>

    <div className={"md:hidden h-[100dvh] bg-white relative flex flex-col"}>
      <div className={"min-h-0 flex-1 relative"}>
        <Image src={"/hero-bg-mobile.svg"} alt={"hero-mobile"} fill/>
      </div>
      <div className={"flex flex-col items-center bg-[#7B9EFF] py-10 gap-10"}>
        <h1 className={"text-center px-10 text-white text-[20px] font-regular"}>Москва ждёт твой деплой!</h1>
        <div className={"flex flex-col items-center gap-2.5 z-1"}>
          <Button text={"Я Студент"} href={"https://lk.itmoscow.pro"}/>
          <Button text={"Я Абитуриент"} href={"/applicant"}/>
        </div>
      </div>
    </div>
  </>);
}
