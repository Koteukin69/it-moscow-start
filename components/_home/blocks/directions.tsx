"use client";

import Title from "../components/title";
import DirectionCard from "../components/direction-card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Direction} from "@/lib/types"
import Orb from "@/components/orb";
import {ButtonLink} from "../components/buttonLink";
import Link from "next/link";

export default function Directions({directions}: {directions: Direction[]}) {
  const directionsCategories = Array.from(new Set(directions.map(item => item.category)));
  const directionsDict = directionsCategories.map(category => ({
      category,
      directions: directions.filter(direction => direction.category === category),
    }));

  return (<>
    <Title
      title={"Какое направление выбрать ребёнку?"}
      description={"13 востребованных специальностей и профессий с трудоустройством в ведущие компании страны"}
    />
    <div className={"flex justify-stretch flex-row gap-10 w-full"}>
      <Tabs className={"flex flex-col gap-4 w-full items-center flex-[2]"} defaultValue={directionsCategories[0]}>
        <DirectionsTabList tabs={directionsCategories}/>
        {directionsDict.map((item, i) => (
          <TabsContent className={"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"} value={item.category} key={i}>
            {item.directions.map((direction, i) => (
              <DirectionCard direction={direction} key={i} />
            ))}
          </TabsContent>
        ))}
      </Tabs>
      <div className={"pt-[52px] hidden lg:block flex-1"}>
        <div className="sticky top-[40%] w-full flex flex-col gap-4">
          <p className={"py-3 px-5 glass rounded-lg rounded-bl-none w-[90%] self-end bg-black/5 -mb-2"}><span className={"font-semibold"}>Привет!</span> Можешь задавать любые вопросы по колледжу, я с радостью отвечу.</p>
          <div className="flex gap-5 items-center">
            <div className={"w-30 aspect-square glass-dark rounded-full relative"}><Orb resolution={4} speed={2} blurMin={.5} blurMax={3}/></div>
            <p className={"w-full text-xl"}>Я <span className={"font-semibold"}>Орб</span> - ИИ помощник IT.Москвы</p>
          </div>
          <ButtonLink href={"abit"} text={"Задать вопрос"} className={"bg-white text-black! font-semibold! rounded-xl!"}/>
        </div>
      </div>
    </div>
  </>);
}

function DirectionsTabList({tabs}: {tabs: string[]}) {
  return <TabsList variant={"line"}>
    {tabs.map((tab, i) => <TabsTrigger value={tab} className="text-white/60! hover:text-white! data-[state=active]:text-white! cursor-pointer" key={i}>{tab}</TabsTrigger>)}
  </TabsList>
}