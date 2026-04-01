"use client";

import {useState} from "react";
import {Direction} from "../blocks/directions"

import Badge from "../components/badge";
import Image from "next/image";
import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog";

export default function DirectionCard({direction, ...props}: {direction: Direction} & React.HTMLAttributes<HTMLDivElement>) {
  const [open, setOpen] = useState(false);

  return (<>
    <div onClick={() => setOpen(true)} className={"p-4 glass bg-white/10 rounded-[10px] w-xs flex flex-col gap-2.5 relative hover:scale-[105%] transition transition-transform duration-100 select-none"} {...props}>
      <DirectionCardImage src={direction.image} alt={direction.name} />
      <div className={"flex flex-row justify-between items-end"}>
        <div className={"text-[20px] -mb-1"}>{direction.name}</div>
        <Badge className={"bg-[#7B9EFF]"}><p>{direction.code}</p></Badge>
      </div>
    </div>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={"bg-[#7B9EFF] sm:[&]:max-w-[80%]"}>
        <DialogTitle>{direction.name}</DialogTitle>
        {direction.description?.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </DialogContent>
    </Dialog>
  </>);
}

function DirectionCardImage({src, alt}: {src?: string, alt: string}) {
  return (
    <div className={"w-full aspect-video"}>
      {src ? (
        <Image src={src} alt={alt} fill className={"rounded-[5px]"}/>
      ) : (
        <div className={"flex justify-center items-center h-full px-4 text-center bg-gray-300/20 rounded-[5px]"}>
          <p>Изображение &quot;{alt}&quot; не найдено</p>
        </div>
      )}
    </div>
  );
}