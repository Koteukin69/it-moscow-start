'use client';

import Title from "../components/title";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {useState, useEffect} from "react";

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

  return (<>
    <Title
      title={"О колледже"}
      description={"Видео по колледжу — узнайте, как проходит обучение и чем живут наши студенты"}
    />
    <div className="w-full flex flex-row justify-center items-center gap-2.5 max-w-5xl">
      <ChevronLeft onClick={() => setVideoId((videoId - 1 + VIDEOS_COUNT) % VIDEOS_COUNT)} className={"cursor-pointer active:text-[#7B9EFF] z-1"} size={100}/>
      <div className={"w-full aspect-video"}>
        <Video video={DEFAULT_VIDEOS[videoId]}/>
      </div>
      <ChevronRight onClick={() => setVideoId((videoId + 1) % VIDEOS_COUNT)} className={"cursor-pointer active:text-[#7B9EFF] z-1"} size={100}/>
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