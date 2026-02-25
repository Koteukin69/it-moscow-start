'use client';

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/nav";
import OrbAnimation from "@/components/orb";
import Chat, {ChatStep} from "@/components/chat";
import ActionButtons from "@/components/action_buttons";
import Link from "next/link";
import {Send} from "lucide-react";

interface ApplicantChatProps {
  user: { name: string; phone?: string } | null;
  userId?: string;
}

export default function ApplicantChat({ user, userId }: ApplicantChatProps) {
  const router = useRouter();
  const steps: ChatStep[] = useMemo(() => [
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
    { type: "component", render: () => <ActionButtons /> },
    { type: "component", render: () => (
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 max-w-sm">
        <div className="flex flex-col gap-1">
          <p className="font-semibold leading-snug">Поможем определиться с направлением</p>
          <p className="text-xs text-muted-foreground">
            Мастер-классы, онлайн-уроки, лайфхаки и напоминания в период поступления — подписывайся на <span className={"text-foreground"}>«Поступи в IT.Москва»</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="https://t.me/itmoscowprivet1"
            target="_blank"
            className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Send className="size-3"/>
            Telegram
          </Link>
          <Link
            href="https://vk.com/itmoscowprivet"
            target="_blank"
            className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-3">
              <path d="m9.489.004.729-.003h3.564l.73.003.914.01.433.007.418.011.403.014.388.016.374.021.36.025.345.03.333.033c1.74.196 2.933.616 3.833 1.516.9.9 1.32 2.092 1.516 3.833l.034.333.029.346.025.36.02.373.025.588.012.41.013.644.009.915.004.98-.001 3.313-.003.73-.01.914-.007.433-.011.418-.014.403-.016.388-.021.374-.025.36-.03.345-.033.333c-.196 1.74-.616 2.933-1.516 3.833-.9.9-2.092 1.32-3.833 1.516l-.333.034-.346.029-.36.025-.373.02-.588.025-.41.012-.644.013-.915.009-.98.004-3.313-.001-.73-.003-.914-.01-.433-.007-.418-.011-.403-.014-.388-.016-.374-.021-.36-.025-.345-.03-.333-.033c-1.74-.196-2.933-.616-3.833-1.516-.9-.9-1.32-2.092-1.516-3.833l-.034-.333-.029-.346-.025-.36-.02-.373-.025-.588-.012-.41-.013-.644-.009-.915-.004-.98.001-3.313.003-.73.01-.914.007-.433.011-.418.014-.403.016-.388.021-.374.025-.36.03-.345.033-.333c.196-1.74.616-2.933 1.516-3.833.9-.9 2.092-1.32 3.833-1.516l.333-.034.346-.029.36-.025.373-.02.588-.025.41-.012.644-.013.915-.009ZM6.79 7.3H4.05c.13 6.24 3.25 9.99 8.72 9.99h.31v-3.57c2.01.2 3.53 1.67 4.14 3.57h2.84c-.78-2.84-2.83-4.41-4.11-5.01 1.28-.74 3.08-2.54 3.51-4.98h-2.58c-.56 1.98-2.22 3.78-3.8 3.95V7.3H10.5v6.92c-1.6-.4-3.62-2.34-3.71-6.92Z"/>
            </svg>
            ВКонтакте
          </Link>
        </div>
      </div>
    )},
  ], []);
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
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }, [user, router]);

  const initialData = user
    ? { name: user.name, phone: user.phone ?? "Пропустить" }
    : undefined;

  return (
    <div className="flex align-center h-dvh">
      <div className={"overflow-hidden absolute -inset-x-[20%] w-screen h-dvh -z-1 flex items-center justify-start"}>
        <div className={"h-dvh aspect-square"}>
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
