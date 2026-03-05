'use client';

import Orb from "@/components/orb";
import {Button} from "@/components/ui/button";
import {useState} from "react";

export default function FAQ({questions}: {questions: {question: string, answer: string}[]}) {
  const [answer, setAnswer] = useState<string>("Выбери вопрос — я отвечу!");
  const [intervalValue, setIntervalValue] = useState<NodeJS.Timeout>();

  return <div className={"flex flex-col md:flex-row justify-center min-h-dvh items-center"}>
    <div className={"flex w-full flex-col justify-center items-center"}>
      <div className={"w-full max-w-100 aspect-square"}>
        <Orb/>
      </div>
      <div className={"text-center min-h-30 max-w-sm font-semibold"}>
        {answer.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
    <div className={"flex max-w-sm sm:max-w-md flex-col justify-center gap-3 pr-10 md:pr-20 h-fit py-20"}>
      {questions.map((question, index) => (
        <Button variant={"link"} className={"text-wrap h-fit w-fit text-left"} key={index} onClick={() => {
          window.scrollTo(0, 0);
          let i = 0;
          let result = "";

          const interval = setInterval(() => {
            result+=question.answer[i];
            setAnswer(result);
            if (i === question.answer.length - 1) clearInterval(interval);
            i++;
          }, 10);

          clearInterval(intervalValue);
          setIntervalValue(interval);
        }}>{question.question}</Button>
      ))}
    </div>
  </div>;
}