"use client";

import {useState} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {ArrowLeft, Menu, X} from "lucide-react";
import {cn} from "@/lib/utils";

const navLinks = [
  {label: "Направления", href: "#directions"},
  {label: "Поступление", href: "#enrollment"},
  {label: "О колледже", href: "#video"},
  {label: "Курсы", href: "#courses"},
  {label: "Контакты", href: "#footer"},
];

export default function ParentHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-6 sm:px-10">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href="/">
            <ArrowLeft size={16}/>
            Вернуться
          </Link>
        </Button>

        <nav className="hidden gap-1 md:flex">
          {navLinks.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" className="text-sm" asChild>
              <a href={link.href}>{link.label}</a>
            </Button>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
        >
          {open ? <X size={20}/> : <Menu size={20}/>}
        </Button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/40 bg-background/95 backdrop-blur-md transition-all duration-150 md:hidden",
          open ? "max-h-96" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3 w-full items-end">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground"
              asChild
              onClick={() => setOpen(false)}
            >
              <a href={link.href}>{link.label}</a>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
