'use client';

import Image from "next/image";
import Nav from "../components/nav";
import {ButtonLink} from "../components/buttonLink";
import {useEffect, useState} from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <header className="fixed w-[100vw] top-4 px-5 sm:px-13 py-4 flex flex-row items-center justify-between z-50">
    <Logo className={"bg-[#021750] p-2 rounded-full w-11 aspect-square glass z-50"} />
    <Nav scrolled={scrolled}/>
    <ButtonLink className={"hidden xl:inline bg-[#021750]"} text={"Хочу Поступить"} href={"#admission"}/>
  </header>;
}

function Logo({className}: {className?: string}) {
  return <div className={`${className}`}>
    <div className={`relative h-full w-full`}>
      <Image className={"absolute inset-2.5"} src={"/logo.svg"} alt={"logo"} fill />
    </div>
  </div>
}