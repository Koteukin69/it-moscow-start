"use client";

import Title from "../components/title";
import DirectionCard from "../components/direction-card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

export type Direction = {
  name: string,
  code: string,
  image?: string,

  budget?: {name: string, amount: number}[],
  description?: string,
  program?: string,
  for?: string,
  become?: string,
};

const DEFAULT_WEB_DIRECTION: Direction = {
  name: "Веб разработка",
  code: "09.02.09",
  description: `Создание сайтов, веб-приложений и цифровых сервисов: от лендингов до сложных онлайн-платформ и личных кабинетов.
Веб-разработчики нужны в любой IT-компании, стартапе, банке, digital-агентстве. Это одна из самых стабильных и универсальных профессий.`,
  budget: [{name: "9 класс (ул. Академика Миллионщикова, 20, просп.Вернадского, 29 А)", amount: 210}],
  program: `Frontend-разработка: HTML, CSS, JavaScript
Backend-разработка, базы данных, API
Работа с современными фреймворками
Проектная и командная разработка
Основы UX и логики пользовательских интерфейсов`,
  for: `Тем, кто хочет создавать реальные IT-продукты
Тем, кому нравится логика и работа с кодом
Тем, кто хочет видеть результат своей работы быстро`,
  become: `Frontend-разработчик
Backend-разработчик
Fullstack-разработчик
Разработчик цифровых продуктов`,
}

const DEFAULT_DIRECTIONS: {name: string, directions: Direction[]}[] = [
  {name: "IT", directions: Array(6).fill(DEFAULT_WEB_DIRECTION)},
  {name: "Дизайн", directions: Array(3).fill(DEFAULT_WEB_DIRECTION)},
  {name: "Производство", directions: Array(4).fill(DEFAULT_WEB_DIRECTION)},
];

const directions = DEFAULT_DIRECTIONS;
const directionsNames = directions.map(item => item.name);

export default function Directions() {
  return (<>
    <Title
      title={"Какое направление выбрать ребёнку?"}
      description={"13 востребованных специальностей и профессий с трудоустройством в ведущие компании страны"}
    />
    <Tabs className={"flex flex-col gap-4"} defaultValue={directionsNames[0]}>
      <DirectionsTabList tabs={directionsNames}/>
      {directions.map((item, i) => (
        <TabsContent className={"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"} value={item.name} key={i}>
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