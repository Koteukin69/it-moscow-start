"use client";

import Title from "../components/title";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {useState} from "react";

type Earning = {
  name: string;
  junior: number;
  middle: number;
  senior: number;
}

const earnings: Earning[] = [
  {name: "Веб разработка", junior: 65000, middle: 170000, senior: 350000},
  {name: "Информационная безопасность", junior: 70000, middle: 160000, senior: 320000},
  {name: "Разработка игр", junior: 80000, middle: 180000, senior: 400000},
]

export default function Earning() {
  const [selected, setSelected] = useState(0);
  const earning = earnings[selected];

  const max = Math.max(earning.junior, earning.middle, earning.senior);

  const levels = [
    { label: "Junior", experience: "до 1 года", salary: earning.junior },
    { label: "Middle", experience: "1–3 года", salary: earning.middle },
    { label: "Senior", experience: "5+ лет", salary: earning.senior },
  ];

  return (<>
    <Title title={"Заработок в IT"} description={"Заработок будет расти вместе с опытом, а работать можно из любой точки мира!"}/>
    <div className="w-full sm:px-[71px] lg:px-[142px]">
      <div className="absolute">
        <Select value={selected.toString()} onValueChange={(v) => setSelected(Number(v))}>
          <SelectTrigger>
            <SelectValue/>
          </SelectTrigger>
          <SelectContent side="bottom" align="start" position={"popper"} className="bg-transparent glass-dark" >
            {earnings.map((earning, i) => (
              <SelectItem className={"hover:bg-black/10! focus:bg-black/20!"} value={i.toString()} key={i}>{earning.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-row items-end h-150 w-full gap-4">
        {levels.map((level) => (
          <div
            key={level.label}
            className="flex flex-col justify-between items-center w-full bg-white/10 glass-dark transition transition-all duration-200"
            style={{ height: `${(level.salary / max) * 100}%` }}
          >
            <p className="text-[20px] leading-[10px] -mt-[5px] font-semibold">от {level.salary.toLocaleString("ru-RU")} ₽</p>
            <div className={"flex flex-col items-center"}>
              <p className="font-light text-[18px]">{level.experience}</p>
              <p className="text-[24px]">{level.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>)
}