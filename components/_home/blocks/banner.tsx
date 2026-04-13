import Image from "next/image";
import {Skeleton} from "@/components/ui/skeleton";

export type Link = {
  name: string;
  href: string;
}

export type Image = {
  src: string;
  alt: string;
}

export default function Banner({title, subtitle, links, image}: {title: string, subtitle: string, links: Link[], image?: Image}) {
  return (<div className={"flex flex-row gap-auto justify-between w-full bg-gradient-to-r from-[#7B9EFF]/20 to -[#7B9EFF]/4 glass-dark rounded-[10px]"}>
    <div className={"flex flex-col p-10 gap-5 w-full max-w-full"}>
      <div className={"font-medium text-[32px]"}>{title}</div>
      <div className={"text-[20px]"}>{subtitle}</div>
      <div className={"flex flex-col sm:flex-row items-start gap-2.5 text-[20px] font-medium"}>
        {links.map((link, i) => (
          <a href={link.href} className={"px-7.5 py-2 bg-[#3053B2] rounded-[10px] hover:underline"} key={i}>{link.name}</a>
        ))}
      </div>
    </div>
    <div className={"w-full relative hidden xl:block"}>
      {image ? (
        <Image src={image.src} alt={image.alt} fill className={"rounded-[10px]"}/>
      ) : (
        <Skeleton className="absolute inset-0" />
      )}
    </div>
  </div>);
}