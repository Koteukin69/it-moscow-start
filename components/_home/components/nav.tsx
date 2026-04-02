"use client";

import Link from "next/link";
import {useState, useEffect} from "react";
import {Menu} from "lucide-react";

const navLinks: { text: string; href: string }[] = [
  {"text": "Направления", "href": "#directions"},
  {"text": "О колледже", "href": "#about"},
  {"text": "Курсы", "href": "#courses"},
  {"text": "Поступление", "href": "#admission"},
  {"text": "Контакты", "href": "#contacts"},
  {"text": "Мероприятия", "href": "/"},
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (<>
    <div className={"xl:hidden"}>
      <Menu/>
    </div>
    <div className={`hidden xl:flex fixed top-3 z-50 justify-center pointer-events-none`} style={{ left: 0, right: 0, width: '100vw' }}>
      <div className={`pointer-events-auto bg-white rounded-full px-7.5 py-2.5 flex flex-row gap-5 text-center transition-shadow duration-300 ${scrolled ? "shadow-md" : ""}`}>
        <NavLinks/>
      </div>
    </div>
  </>)
}

function NavLinks() {
  return <>
    {navLinks.map((link, i) => (
      <Link className={"text-16 font-normal hover:underline"} href={link.href} key={i}>
        {link.text}
      </Link>
    ))}
  </>
}