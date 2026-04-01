import Link from "next/link";
import React from "react";

export default function Button({href, text, ...props}: {href: string, text: string} & React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} >
    <Link className={"text-16 font-normal hover:underline px-5 py-2.5 bg-[#7B9EFF] text-white rounded-full glass after:absolute after:rounded-full after:inset-0 after:bg-white/0 hover:after:bg-white/10"} href={href}>
      {text}
    </Link>
  </div>
}