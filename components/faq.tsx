'use client';

import Orb from "@/components/orb";
import {Button} from "@/components/ui/button";
import {useState} from "react";

export default function FAQ({questions}: {questions: {question: string, answer: string}[]}) {
  const [anwser, setAnwser] = useState<string>("Выбери вопрос — я отвечу!");

  return <div className={"flex flex-col md:flex-row justify-center min-h-screen items-center"}>
    <div className={"flex w-full flex-col justify-center items-center"}>
      <div className={"w-full max-w-100 aspect-square"}>
        <Orb/>
      </div>
      <div className={"text-center min-h-30 max-w-sm font-semibold"}>{anwser}</div>
    </div>
    <div className={"flex max-w-sm sm:max-w-md flex-col justify-center gap-3 pr-10 md:pr-20 h-fit pb-20"}>
      {questions.map((question, index) => (
        <Button variant={"link"} className={"text-wrap h-fit w-fit text-left"} key={index} onClick={() => {setAnwser(question.answer)}}>{question.question}</Button>
      ))}
    </div>
  </div>;
}