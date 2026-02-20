"use client";

import {useState} from "react";
import Image from "next/image";
import {Card, CardContent} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {TrendingUp} from "lucide-react";
import {salaryData} from "@/lib/salary-data";

const levelColors = {
  Junior: "text-blue-400",
  Middle: "text-yellow-400",
  Senior: "text-green-400",
};

function formatSalary(n: number) {
  return `от ${n.toLocaleString("ru-RU")} ₽`;
}

export default function ParentEarnings() {
  const [selected, setSelected] = useState(salaryData[0].id);
  const current = salaryData.find((s) => s.id === selected) ?? salaryData[0];

  return (
    <section id="earnings" className="relative mx-auto max-w-6xl overflow-hidden px-4 py-20 sm:px-6">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-15">
        <Image
          src="/infinity-symbolnew.png"
          alt=""
          width={800}
          height={400}
          className="object-contain"
        />
      </div>

      <div className="relative z-10">
        <div className="mb-12 flex flex-col gap-3 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Заработок в IT
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Заработок будет расти вместе с опытом, а работать можно из любой
            точки мира!
          </p>
        </div>

        <div className="mb-8 max-w-xs">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger>
              <SelectValue/>
            </SelectTrigger>
            <SelectContent>
              {salaryData.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {current.levels.map((lvl) => (
            <Card key={lvl.level}>
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <div className={`flex items-center gap-2 text-sm font-semibold ${levelColors[lvl.level]}`}>
                  <TrendingUp className="size-4"/>
                  {lvl.level}
                </div>
                <span className="text-3xl font-bold">{formatSalary(lvl.salary)}</span>
                <span className="text-sm text-muted-foreground">{lvl.experience}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
