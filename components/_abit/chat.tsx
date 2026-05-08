"use client";

import ChatInput from "@/components/_abit/chat-input";
import { useMemo, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {ArrowLeft} from "lucide-react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import Orb from "@/components/orb";

type Message = {
  message: string;
  sender: "client" | "server";
};

type MessageGroup = Message[];

type Action = "thinking" | "stopped";

type AIResponse =
  | {
  text: string;
  model: string;
  finishReason: string | null;
  usage: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}
  | {
  error: string;
  code?: string;
};

export default function Chat({ greeting }: { greeting: string }) {
  const [value, setValue] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [action, setAction] = useState<Action | undefined>();
  const [started, setStarted] = useState<boolean>();
  const [answerStream, setAnswerStream] = useState<string>();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

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

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    requestIdRef.current++;

    setAnswerStream(undefined);
    setAction("stopped");
  }

  function appendMessage(message: Message) {
    setMessages((prev) => [...prev, message]);
  }

  async function requestAnswer(prompt: string, requestId: number) {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("/api/abit/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      const data = (await res.json().catch(() => null)) as AIResponse | null;

      if (requestIdRef.current !== requestId) return;

      if (!res.ok || !data || "error" in data) {
        appendMessage({
          message: data && "error" in data ? data.error : "AI request failed",
          sender: "server",
        });

        setAnswerStream(undefined);
        setAction(undefined);
        return;
      }

      appendMessage({
        message: data.text,
        sender: "server",
      });

      setAnswerStream(undefined);
      setAction(undefined);
    } catch (error) {
      if (requestIdRef.current !== requestId) return;

      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      appendMessage({
        message: "Ошибка запроса к AI.",
        sender: "server",
      });

      setAnswerStream(undefined);
      setAction(undefined);
    } finally {
      if (requestIdRef.current === requestId) {
        abortControllerRef.current = null;
      }
    }
  }

  function onSubmit() {
    const prompt = value.trim();

    if (!prompt && action !== "thinking") return;

    setStarted(true);

    if (prompt) {
      clearAnswerTimers();

      abortControllerRef.current?.abort();

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      appendMessage({
        message: prompt,
        sender: "client",
      });

      setAction("thinking");
      setAnswerStream(undefined);
      setValue("");

      void requestAnswer(prompt, requestId);
    } else {
      stopAnswer();
    }
  }

  const messageGroups = useMemo<MessageGroup[]>((() => {
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
  }), [messages]);

  return (
    <div className="w-full h-svh bg-[#18181B] flex flex-row justify-stretch items-center">
      <div className="flex items-center justify-between absolute left-8 top-8 z-1 md:hidden">
        <Button variant="ghost" size="default" className="gap-1 sm:text-md" asChild>
          <Link href="/">
            <ArrowLeft size={16}/>
            Вернуться
          </Link>
        </Button>
      </div>
      <div className="hidden md:flex flex-col items-start grow h-full max-w-100 glass-dark bg-black/10 p-5 pb-7.5 gap-6.25">
        <Button variant="ghost" size="default" className="gap-1 sm:text-md" asChild>
          <Link href="/">
            <ArrowLeft size={16}/>
            Вернуться
          </Link>
        </Button>
        <div className="flex flex-col gap-2.5 px-2 h-full">
          <Link className={"hover:underline active:opacity-50"} href="/quiz">Тест: Кто ты в IT?</Link>
          <Link className={"hover:underline active:opacity-50"} href="/quide">Гид по специальностям/профессиям</Link>
          <Link className={"hover:underline active:opacity-50"} href="/cources">Курсы IT.Москва School</Link>
          <Link className={"hover:underline active:opacity-50"} href="/events">Наши мероприятия</Link>
          <Link className={"hover:underline active:opacity-50"} href="https://itmoscow.mskobr.ru/o-nas/pedagogicheskii-sostav">Состав преподователей</Link>
          <Link className={"hover:underline active:opacity-50"} href="/faq">FAQ (Вопрос-ответ)</Link>
        </div>
        <Button variant="default" size="default" className="gap-1 sm:text-md w-full font-black text-[#18181B] active:bg-[#7B9EFF]" asChild>
          <Link href="/">
            Играть
          </Link>
        </Button>
      </div>
      <div className="flex flex-col gap-5 items-center justify-center px-6.25 py-12.5 sm:px-17.5 md:px-6.25 grow-2 h-full">
        <div className={`w-full max-w-2xl flex flex-col gap-5 px-2.5 sm:px-5 max-h-full overflow-y-auto transition-[flex-grow,margin] duration-300 ease-in-out ${started ? "flex-1 mt-10" : "flex-none"}`}>
          {started ? (
            <>
              {messageGroups.map((messageGroup, i) => (
                <div className={`w-full flex flex-col gap-2.5 ${messageGroup[0].sender === "client" ? "items-end" : ""}`} key={i}>
                  {messageGroup.map((message, j) => (
                    <MessageRender message={message} key={j} />
                  ))}
                </div>
              ))}
              {action &&
                (answerStream ? (
                  <MessageRender message={{ message: answerStream, sender: "server" }} />
                ) : (
                  <div className="text-white/50">
                    {action === "thinking" ? "Думаю..." : "Остановлено."}
                  </div>
                ))}
            </>
          ) : (
            <>
              <div className={"flex justify-center"}>
                <div className={"w-50 h-50 relative"}>
                  <Orb/>
                </div>
              </div>
              <div className="text-[24px] text-center">
                <span className="text-[#7B9EFF]">{greeting}</span> Задай вопрос, и я сразу отвечу!
              </div>
            </>
          )}
        </div>

        <div className="w-full max-w-2xl flex flex-col gap-5 items-center">
          <ChatInput
              thinking={action === "thinking"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}

function MessageRender({ message }: { message: Message }) {
  const isClient = message.sender === "client";

  return (
    <div
      className={[
        "text-white/90 leading-relaxed",
        "[&>*+*]:mt-3",
        "[&_ul]:list-disc [&_ul]:pl-5",
        "[&_ol]:list-decimal [&_ol]:pl-5",
        "[&_li+li]:mt-1",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-[10px] [&_pre]:bg-black/30 [&_pre]:p-3",
        "[&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
        isClient ? "px-4 py-2.5 bg-white/10 rounded-[10px]" : "",
      ].join(" ")}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
        {message.message}
      </ReactMarkdown>
    </div>
  );
}
