'use client';

import Title from "../components/title";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {useState, useEffect} from "react";
import {Separator} from "@/components/ui/separator";

type Video = {src: string, title: string};

const DEFAULT_VIDEOS: Video[] = [
  {
    src: "https://vkvideo.ru/video_ext.php?oid=-172223119&id=456240004&hash=ec18a353bac01724&hd=3",
    title: "Видео-экскурсия по IT.Москва"
  },
  {
    src: "https://vkvideo.ru/video_ext.php?oid=-172223119&id=456240028&hash=298a9185aefa3228&hd=3",
    title: "АНОНС ЭКОСИСТЕМЫ IT.МОСКВА"
  }
]

const VIDEOS_COUNT = DEFAULT_VIDEOS.length;

export default function About() {
  const [videoId, setVideoId] = useState(0);

  const nextVideo = () => setVideoId((videoId - 1 + VIDEOS_COUNT) % VIDEOS_COUNT)

  const pastVideo = () => setVideoId((videoId + 1) % VIDEOS_COUNT)

  return (<>
    <Title
      title={"О колледже"}
      description={"Видео по колледжу — узнайте, как проходит обучение и чем живут наши студенты"}
    />
    <div className="flex flex-col items-center gap-4 w-full">
      <div className={"flex sm:hidden flex-row justify-between w-full"}>
        <ChevronLeft onClick={pastVideo} className={"cursor-pointer active:text-[#7B9EFF]"} size={50}/>
        <ChevronRight onClick={nextVideo} className={"cursor-pointer active:text-[#7B9EFF]"} size={50}/>
      </div>
      <div className="w-full flex flex-row justify-center items-center gap-2.5 max-w-5xl">
        <ChevronLeft onClick={pastVideo} className={"hidden sm:block cursor-pointer active:text-[#7B9EFF]"} size={100}/>
        <div className={"w-full aspect-video"}>
          <Video video={DEFAULT_VIDEOS[videoId]}/>
        </div>
        <ChevronRight onClick={nextVideo} className={"hidden sm:block cursor-pointer active:text-[#7B9EFF]"} size={100}/>
      </div>
    </div>
  </>);
}


function Video({video}: {video: Video}) {
  return (<>
    <iframe
      src={video.src}
      title={video.title}
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock"
      allowFullScreen
      loading="eager"
      className="h-full w-full rounded-[20px]"
    />
  </>);
}