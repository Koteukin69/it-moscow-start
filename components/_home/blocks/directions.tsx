  "use client";

  import {useEffect, useState} from "react";

  import Title from "../components/title";
  import DirectionCard from "../components/direction-card";

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

  export default function Directions() {
    const [directions, setDirections] = useState(DEFAULT_DIRECTIONS[0].directions);

    return (<>
      <Title
        title={"Какое направление выбрать ребёнку?"}
        description={"13 востребованных специальностей и профессий с трудоустройством в ведущие компании страны"}
      />
      <div className="grid grid-cols-3 gap-4">
        {directions.map((direction, i) => (
          <DirectionCard direction={direction} key={i} />
        ))}
      </div>
    </>);
  }
