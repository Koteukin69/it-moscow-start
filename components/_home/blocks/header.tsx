import Image from "next/image";
import Nav from "../components/nav";
import Button from "../components/button";

export default function Header() {
  return <header className="w-full px-13 py-4 flex flex-row items-center justify-between">
    <Logo/>
    <Nav/>
    <Button className={"hidden sm:block"} text={"Хочу Поступить"} href={"#admission"}/>
  </header>;
}

function Logo() {
  return <div>
    <Image src={"/logo-horizontal.svg"} alt={"logo"} width={197} height={35} />
  </div>
}