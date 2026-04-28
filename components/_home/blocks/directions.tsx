"use client";

import Title from "../components/title";
import DirectionCard from "../components/direction-card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Direction} from "@/lib/types"

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
    <Tabs className={"flex flex-col gap-4 w-full items-center"} defaultValue={directionsCategories[0]}>
      <DirectionsTabList tabs={directionsCategories}/>
      {directionsDict.map((item, i) => (
        <TabsContent className={"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"} value={item.category} key={i}>
          {item.directions.map((direction, i) => (
            <DirectionCard direction={direction} key={i} />
          ))}
        </TabsContent>
      ))}
    </Tabs>
  </>);
}

function DirectionsTabList({tabs}: {tabs: string[]}) {
  return <TabsList variant={"line"}>
    {tabs.map((tab, i) => <TabsTrigger value={tab} className="text-white/60! hover:text-white! data-[state=active]:text-white!" key={i}>{tab}</TabsTrigger>)}
  </TabsList>
}