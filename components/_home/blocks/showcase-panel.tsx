import {ImageData} from "@/lib/types";
import Image from "next/image";

export default function ShowcasePanel({image, color, title}: {image?: ImageData, color: string, title: string}) {
  return <div className="w-full relative overflow-hidden">
    {image && <Image className={"h-[80%] sm:h-full w-auto max-w-none absolute right-0 bottom-0"} src={image.src} alt={image.alt} width={832} height={447}/>}
    <div className={"text-[8dvw] sm:text-[5dvw] font-black leading-none -mb-[1.2dvw] sm:-mb-[0.6dvw] pl-10"} style={{color}}>{title}</div>
    <div className={"w-full h-50 sm:h-100 rounded-[40px]"} style={{backgroundColor: color}} />
  </div>
}