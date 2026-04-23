import {ImageData} from "@/lib/types";
import Image from "next/image";

export default function ShowcasePanel({image, color, title}: {image?: ImageData, color: string, title: string}) {
  return <div className="w-full relative">
    {image && <Image className={"object-contain"} src={image.src} alt={image.alt} fill/>}
    <div className={"text-[5dvw] font-black leading-none -mb-3 pl-10"} style={{color}}>{title}</div>
    <div className={"w-full h-100 rounded-[40px]"} style={{backgroundColor: color}} />
  </div>
}