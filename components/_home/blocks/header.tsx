import Image from "next/image";
import Nav from "../components/nav";
import Button from "../components/button";

export default function Header() {
  return <header className="w-full px-5 sm:px-13 py-4 flex flex-row items-center justify-between">
    <Logo className={"max-w-[50%]"}/>
    <Nav/>
    <Button className={"hidden xl:block"} text={"Хочу Поступить"} href={"#admission"}/>
  </header>;
}

function Logo({className}: {className?: string}) {
  return <div className={className}>
    <Image src={"/logo-horizontal.svg"} alt={"logo"} width={197} height={35} />
  </div>
}