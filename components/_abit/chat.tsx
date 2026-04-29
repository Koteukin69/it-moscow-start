"use client";

import ChatInput from "@/components/_abit/chat-input";
import {useMemo, useState, useRef} from "react";

type Message = {
  message: string,
  sender: "client" | "server",
}

type MessageGroup = Message[]

type Action = "thinking" | "stopped"

export default function Chat({greeting}: {greeting: string}) {
  const [value, setValue] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [action, setAction] = useState<Action | undefined>();
  const [started, setStarted] = useState<boolean>();
  const [answerStream, setAnswerStream] = useState<string>();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function runAfter(func: () => void, seconds: number) {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      func();
      timerRef.current = null;
    }, seconds * 1000);
  }

  function clearAnswerTimers() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
  }

  function stopAnswer() {
    clearAnswerTimers();

    setAnswerStream(undefined);
    setAction("stopped");
  }

  function answer() {
    const fullAnswer = `Приветствую! Всем этим сайтом занимается один первокурсник.
Из-за этого бот пока что в разработке, и отвечает этим шаблонным сообщением. 
Спасибо за понимание!`;

    let index = 0;

    setAnswerStream("");

    streamTimerRef.current = setInterval(() => {
      index++;

      setAnswerStream(fullAnswer.slice(0, index));

      if (index >= fullAnswer.length) {
        if (streamTimerRef.current) {
          clearInterval(streamTimerRef.current);
          streamTimerRef.current = null;
        }

        appendMessage({
          message: fullAnswer,
          sender: "server",
        });

        setAnswerStream(undefined);
        setAction(undefined);
      }
    }, 25);
  }

  function appendMessage(message: Message) {
    setMessages((prev) => [...prev, message]);
  }

  function onSubmit() {
    if (!value?.trim() && action !== "thinking") return;

    setStarted(true);

    if (value.trim()) {
      clearAnswerTimers();

      appendMessage({ message: value.trim(), sender: "client" });
      setAction("thinking");
      setAnswerStream(undefined);
      setValue("");

      runAfter(answer, 0.5);
    } else {
      stopAnswer();
    }
  }

  const messageGroups = useMemo<MessageGroup[]>(() => {
    return messages.reduce<MessageGroup[]>((groups, message) => {
      const lastGroup = groups[groups.length - 1];
      const lastMessage = lastGroup?.[lastGroup.length - 1];

      if (lastMessage?.sender === message.sender) {
        lastGroup.push(message);
      } else {
        groups.push([message]);
      }

      return groups;
    }, []);
  }, [messages]);

  return (<div className={`w-full h-dvh bg-[#18181B] flex flex-col justify-center items-center px-6.25 py-12.5 sm:px-17.5 lg:px-25 gap-5`}>
    <div className={`w-full max-w-2xl flex flex-col gap-5 px-2.5 sm:px-5 max-h-full overflow-y-auto transition-[flex-grow,margin] duration-300 ease-in-out ${started ? "flex-1 mt-10" : "flex-none"}`}>
      {started ? (
        <>
          {messageGroups.map((messageGroup, i) => (
            <div className={`w-full flex flex-col gap-2.5 ${messageGroup[0].sender === "client" && "items-end"}`} key={i}>
              {messageGroup.map((message, j) => (
                <MessageRender message={message} key={j} />
              ))}
            </div>
          ))}
          {action &&
            (answerStream ? (
              <MessageRender message={{message: answerStream, sender: "server"}} />
            ) : (
              <div className={"text-white/50"}>{action === "thinking" ? "Думаю..." : "Остановлено."}</div>
            ))}
        </>
      ) : (
        <div className={"text-[24px] text-center"}>
          <span className={"text-[#7B9EFF]"}>{greeting}</span> Задай вопрос, и я сразу отвечу!
        </div>
      )}
    </div>
    <div className={"w-full max-w-2xl flex flex-col gap-5 items-center"}>
      <ChatInput thinking={action === "thinking"} value={value} onChange={(e) => setValue(e.target.value)} onSubmit={onSubmit} />
    </div>
  </div>);
}

function MessageRender({message}: {message: Message;}) {
  return (<div className={`flex flex-col gap-2.5 ${message.sender === "client" && "px-4 py-2.5 bg-white/10 rounded-[10px]"}`}>{
    message.message.split("\n").map((line, k) => (
      <p key={k}>{line}</p>
    ))
  }</div>);
}