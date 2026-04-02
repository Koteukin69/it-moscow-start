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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (<>
    <div className={`fixed top-5 right-5 p-2.5 bg-white rounded-lg xl:hidden z-50 ${scrolled ? "shadow-md" : ""}`}>
      <Menu onClick={() => {setOpen(!open)}}/>
    </div>
    <div
      className="fixed right-12.5 top-12.5 grid transition-[grid-template-rows] duration-300 bg-white/80 font-medium glass z-49 rounded-sm"
      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      onClick={() => {setOpen(false)}}
    >
      <div className="overflow-hidden">
        <div className="px-5 py-2.5 flex flex-col text-[16px]">
          <NavLinks/>
        </div>
      </div>
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
      <Link className={"hover:underline w-full text-end text-nowrap"} href={link.href} key={i}>
        {link.text}
      </Link>
    ))}
  </>
}