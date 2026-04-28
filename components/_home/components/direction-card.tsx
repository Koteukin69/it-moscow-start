"use client";

import {Key, useState} from "react";

import Badge from "../components/badge";
import Image from "next/image";
import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog";
import {Direction, ImageAlign} from "@/lib/types";

export default function DirectionCard({direction, ...props}: {
  direction: Direction
} & React.HTMLAttributes<HTMLDivElement>) {
  const [open, setOpen] = useState(false);

  return (<>
    <div onClick={() => setOpen(true)}
         className={"p-4 glass bg-white/10 rounded-[10px] max-w-xs flex flex-col gap-5 justify-between relative hover:scale-[105%] transition-transform duration-100 select-none cursor-pointer"} {...props}>
      <DirectionCardImage align={direction.align} src={direction.image} alt={direction.name}/>
      <div className={"flex flex-row justify-between items-end gap-2.5"}>
        <div className={"text-[20px] -mb-1 line-clamp-3 line-clamp-3"}>{direction.name}</div>
        <Badge className={"bg-[#7B9EFF]"}><p>{direction.code}</p></Badge>
      </div>
    </div>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={"bg-[#7B9EFF] sm:[&]:max-w-[80%]"}>
        <DialogTitle>{direction.name}</DialogTitle>
        {direction.description?.split("\n").map((line: string, i: Key) => (
          <p key={i}>{line}</p>
        ))}
        TODO: Добавить остальной контент в DirectionsDialog
      </DialogContent>
    </Dialog>
  </>);
}

function DirectionCardImage({src, alt, align="center"}: {src?: string, alt: string, align?: ImageAlign}) {
  const objectPosition: Record<ImageAlign, string> = {
    left: "left center",
    center: "center center",
    right: "right center",
  };

  return (
    <div className={"w-full aspect-square relative"}>
      {src ? (
        <Image src={src} alt={alt} fill className={"rounded-[5px] object-contain glass"}
          style={{
            objectPosition: objectPosition[align],
          }}
        />
      ) : (
        <div className={"flex justify-center items-center h-full px-4 text-center bg-gray-300/20 rounded-[5px]"}>
          <p>Изображение &quot;{alt}&quot; не найдено</p>
        </div>
      )}
    </div>
  );
}