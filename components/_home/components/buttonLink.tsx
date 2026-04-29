import Link from "next/link";
import React from "react";

export function ButtonLink({href, text, className}: {href: string, text: string, className?: string}) {
  return <Link className={`text-[16px] text-center font-normal hover:underline px-5 py-2.5 bg-[#7B9EFF] text-white rounded-full glass after:absolute after:rounded-full after:inset-0 after:bg-white/0 hover:after:bg-white/10 ${className}`} href={href}>
    {text}
  </Link>
}

export function Button({text, className, onClick}: {text: string, className?: string, onClick?: () => void}) {
  return <button onClick={onClick} className={`text-[16px] text-center font-normal hover:underline px-5 py-2.5 bg-[#7B9EFF] text-white rounded-full glass after:absolute after:rounded-full after:inset-0 after:bg-white/0 hover:after:bg-white/10 ${className}`}>
    {text}
  </button>
}