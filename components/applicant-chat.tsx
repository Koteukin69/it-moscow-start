'use client';

import { useCallback } from "react";
import Nav from "@/components/nav";
import OrbAnimation from "@/components/orb";
import Chat, {ChatStep} from "@/components/chat";
import ActionButtons from "@/components/action_buttons";

const steps: ChatStep[] = [
  { type: "message", sender: "client", text: "Я — абитуриент" },
  { type: "message", sender: "server", text: "Привет, давай познакомимся!", delay: 800 },
  { type: "message", sender: "server", text: "Напиши своё имя.", delay: 500 },
  { type: "input", key: "name", placeholder: "Ваше имя..." },
  { type: "message", sender: "server", text: "Ещё раз приветствую, {name}.", delay: 500 },
  { type: "message", sender: "server", text: "Ты можешь оставить номер — он нужен, чтобы не потерять прогресс.", delay: 1000 },
  { type: "input", key: "phone", placeholder: "+7 900 123-45-67", regex: /^(\+7|8)9\d{9}$/, error: "Введите корректный номер: +7 9XX XXX-XX-XX", skip: "Пропустить" },
  { type: "condition", key: "phone", match: /^(\+7|8)9\d{9}$/,
    then: [{ type: "message", sender: "server", text: "Спасибо за то что поделился номером.", delay: 500 }] },
  { type: "message", sender: "server", text: "А теперь перейдём к возможностям.", delay: 500 },
  { type: "component", render: ActionButtons },
];

interface ApplicantChatProps {
  user: { name: string; phone?: string } | null;
}

export default function ApplicantChat({ user }: ApplicantChatProps) {
  const handleComplete = useCallback(async (data: Record<string, string>) => {
    if (user) return;
    try {
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone || undefined,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  const initialData = user
    ? { name: user.name, phone: user.phone ?? "Пропустить" }
    : undefined;

  return (
    <div className="flex align-center h-screen">
      <div className={"overflow-hidden absolute -inset-x-[20%] w-screen h-screen -z-1 flex items-center justify-start"}>
        <div className={"h-screen aspect-square"}>
          <OrbAnimation />
        </div>
      </div>
      <div className={"w-full max-w-sm hidden md:flex"}>
        <Nav />
      </div>
      <Chat
        steps={steps}
        onComplete={handleComplete}
        initialData={initialData}
        instant={!!user}
      />
    </div>
  );
}
