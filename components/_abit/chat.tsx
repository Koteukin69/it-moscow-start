"use client";

import ChatInput from "@/components/_abit/chat-input";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { ArrowLeft, ChevronDown, Menu, Trash2, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Orb from "@/components/orb";
import type { ModelType } from "@/lib/ai";

const THINKING_PHRASES = [
  "Думаю...",
  "Ищу решения...",
  "Анализирую...",
  "Формулирую ответ...",
  "Обрабатываю...",
];

const NAV_LINKS = [
  { label: "Тест: Кто ты в IT?", href: "/quiz" },
  { label: "Специальности", href: "/guide" },
  { label: "Курсы", href: "/courses" },
  { label: "Мероприятия", href: "/events" },
  { label: "FAQ", href: "/faq" },
];

const MODEL_OPTIONS: ModelType[] = [
  "Приемная комиссия",
  "База знаний ИТ.Москва",
  "ИТ.Дизайн",
];

const ORBS_TIERS = [
  { label: "Orbs Lite", maxTokens: 500 },
  { label: "Orbs 1.0", maxTokens: 1000 },
  { label: "Orbs Pro", maxTokens: 2000 },
] as const;

type OrbsTier = typeof ORBS_TIERS[number]["label"];

const STORAGE_KEY = "itmoscow-chat-history";
const QUESTIONS_KEY = "itmoscow-questions-used";
const GUEST_KEY = "itmoscow-guest";
const QUESTION_LIMIT = 5;

const TICK_MS = 16;
const ANSWER_PRESETS = ["sunset", "aurora", "neon"] as const;
type OrbPreset = "cyan" | "sunset" | "aurora" | "neon";

type Message = {
  message: string;
  sender: "client" | "server";
  imageBase64?: string;
};

type MessageGroup = Message[];

type Action = "thinking" | "stopped";

type SSEChunk =
  | { text: string; error?: never; imageBase64?: never }
  | { error: string; text?: never; imageBase64?: never }
  | { imageBase64: string; text?: never; error?: never };

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Сегодня";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default function Chat({
  greeting,
  userId,
  userName,
  userAvatar,
}: {
  greeting: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
}) {
  const isAuthenticated = !!userId;

  const [value, setValue] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [action, setAction] = useState<Action | undefined>();
  const [started, setStarted] = useState(false);
  const [answerStream, setAnswerStream] = useState<string>();
  const [thinkingPhrase, setThinkingPhrase] = useState(THINKING_PHRASES[0]);
  const [phraseVisible, setPhraseVisible] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orbPreset, setOrbPreset] = useState<OrbPreset>("cyan");
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>(MODEL_OPTIONS[0]);
  const [orbsTier, setOrbsTier] = useState<OrbsTier>("Orbs 1.0");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const thinkingPhraseIndexRef = useRef(0);
  const currentConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    function loadFromStorage() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try { setConversations(JSON.parse(stored) as Conversation[]); } catch {}
      }
      if (!isAuthenticated) {
        const used = parseInt(localStorage.getItem(QUESTIONS_KEY) ?? "0", 10);
        setQuestionsUsed(isNaN(used) ? 0 : used);
        setIsGuest(localStorage.getItem(GUEST_KEY) === "1");
      }
    }

    loadFromStorage();

    const handlePageShow = (e: PageTransitionEvent) => { if (e.persisted) loadFromStorage(); };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [isAuthenticated]);

  useEffect(() => {
    currentConversationIdRef.current = currentConversationId;
  }, [currentConversationId]);

  useEffect(() => {
    if (messages.length === 0) return;

    setConversations((prev) => {
      const convId = currentConversationIdRef.current;
      let updated: Conversation[];

      if (!convId) {
        const firstUserMessage = messages.find((m) => m.sender === "client");
        const title = (firstUserMessage?.message ?? "Диалог").slice(0, 40);
        const newConv: Conversation = {
          id: crypto.randomUUID(),
          title,
          messages,
          createdAt: Date.now(),
        };
        setCurrentConversationId(newConv.id);
        updated = [newConv, ...prev];
      } else {
        updated = prev.map((c) =>
          c.id === convId ? { ...c, messages } : c,
        );
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [messages]);

  useEffect(() => {
    if (action !== "thinking") {
      thinkingPhraseIndexRef.current = 0;
      setThinkingPhrase(THINKING_PHRASES[0]);
      setPhraseVisible(true);
      return;
    }

    const cycle = setInterval(() => {
      setPhraseVisible(false);
      setTimeout(() => {
        thinkingPhraseIndexRef.current =
          (thinkingPhraseIndexRef.current + 1) % THINKING_PHRASES.length;
        setThinkingPhrase(THINKING_PHRASES[thinkingPhraseIndexRef.current]);
        setPhraseVisible(true);
      }, 300);
    }, 2200);

    return () => clearInterval(cycle);
  }, [action]);

  useEffect(() => {
    const isAnswering = action === "thinking" || !!answerStream;
    if (!isAnswering) {
      setOrbPreset("cyan");
      return;
    }

    let i = 0;
    setOrbPreset(ANSWER_PRESETS[0]);

    const cycle = setInterval(() => {
      i = (i + 1) % ANSWER_PRESETS.length;
      setOrbPreset(ANSWER_PRESETS[i]);
    }, 1500);

    return () => clearInterval(cycle);
  }, [action, answerStream]);

  function clearAnswerTimers() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (streamTimerRef.current) { clearInterval(streamTimerRef.current); streamTimerRef.current = null; }
  }

  function abortAndReset() {
    clearAnswerTimers();
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    requestIdRef.current++;
    setAnswerStream(undefined);
    setAction(undefined);
  }

  function stopAnswer() {
    clearAnswerTimers();
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    requestIdRef.current++;
    setAnswerStream(undefined);
    setAction("stopped");
  }

  function startNewConversation() {
    abortAndReset();
    setMessages([]);
    setStarted(false);
    setCurrentConversationId(null);
    setSidebarOpen(false);
  }

  function loadConversation(id: string) {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;
    abortAndReset();
    setMessages(conv.messages);
    setStarted(true);
    setCurrentConversationId(id);
    setSidebarOpen(false);
  }

  function deleteConversation(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (currentConversationId === id) {
      abortAndReset();
      setMessages([]);
      setStarted(false);
      setCurrentConversationId(null);
    }
  }

  function appendMessage(message: Message) {
    setMessages((prev) => [...prev, message]);
  }

  async function requestAnswer(prompt: string, requestId: number) {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulated = "";

    function finishWithError(message: string) {
      if (requestIdRef.current !== requestId) return;
      clearAnswerTimers();
      appendMessage({ message, sender: "server" });
      setAnswerStream(undefined);
      setAction(undefined);
    }

    function finishWithImage(imageBase64: string) {
      if (requestIdRef.current !== requestId) return;
      clearAnswerTimers();
      appendMessage({ message: "", sender: "server", imageBase64 });
      setAnswerStream(undefined);
      setAction(undefined);
    }

    function startTypewriter() {
      if (requestIdRef.current !== requestId) return;

      if (!accumulated) {
        setAnswerStream(undefined);
        setAction(undefined);
        return;
      }

      const fullText = accumulated;
      const durationMs = Math.min(2000, Math.max(600, fullText.length * 5));
      const charsPerTick = Math.max(1, Math.ceil(fullText.length / (durationMs / TICK_MS)));
      let pos = 0;

      streamTimerRef.current = setInterval(() => {
        const stop = () => {
          if (streamTimerRef.current) {
            clearInterval(streamTimerRef.current);
            streamTimerRef.current = null;
          }
        };

        if (requestIdRef.current !== requestId) {
          stop();
          return;
        }

        pos = Math.min(pos + charsPerTick, fullText.length);
        setAnswerStream(fullText.slice(0, pos));

        if (pos >= fullText.length) {
          stop();
          appendMessage({ message: fullText, sender: "server" });
          setAnswerStream(undefined);
          setAction(undefined);
        }
      }, TICK_MS);
    }

    try {
      const res = await fetch("/api/abit/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          modelType: selectedModel,
          maxTokens: ORBS_TIERS.find((t) => t.label === orbsTier)?.maxTokens ?? 1000,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        finishWithError(data?.error ?? "AI request failed");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6);

          if (raw === "[DONE]") {
            startTypewriter();
            return;
          }

          let parsed: SSEChunk | null = null;
          try { parsed = JSON.parse(raw) as SSEChunk; } catch { continue; }

          if (parsed.error) { finishWithError(parsed.error); return; }
          if (parsed.imageBase64) { finishWithImage(parsed.imageBase64); return; }
          if (parsed.text) { accumulated += parsed.text; }
        }
      }

      startTypewriter();
    } catch (error) {
      if (requestIdRef.current !== requestId) return;
      if (error instanceof DOMException && error.name === "AbortError") return;
      finishWithError("Ошибка запроса к AI.");
    } finally {
      if (requestIdRef.current === requestId) abortControllerRef.current = null;
    }
  }

  function onSubmit() {
    const prompt = value.trim();
    if (!prompt && action !== "thinking") return;

    if (prompt && !isAuthenticated && !isGuest && questionsUsed >= QUESTION_LIMIT) {
      setShowAuthModal(true);
      return;
    }

    setStarted(true);

    if (prompt) {
      clearAnswerTimers();
      abortControllerRef.current?.abort();

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      appendMessage({ message: prompt, sender: "client" });

      if (!isAuthenticated && !isGuest) {
        const next = questionsUsed + 1;
        setQuestionsUsed(next);
        localStorage.setItem(QUESTIONS_KEY, String(next));
      }

      setAction("thinking");
      setAnswerStream(undefined);
      setValue("");

      void requestAnswer(prompt, requestId);
    } else {
      stopAnswer();
    }
  }

  const messageGroups = useMemo<MessageGroup[]>(
    () =>
      messages.reduce<MessageGroup[]>((groups, message) => {
        const lastGroup = groups[groups.length - 1];
        const lastMessage = lastGroup?.[lastGroup.length - 1];
        if (lastMessage?.sender === message.sender) {
          lastGroup.push(message);
        } else {
          groups.push([message]);
        }
        return groups;
      }, []),
    [messages],
  );

  const questionsLeft = Math.max(0, QUESTION_LIMIT - questionsUsed);
  const limitReached = !isAuthenticated && !isGuest && questionsUsed >= QUESTION_LIMIT;
  const userInitial = userName?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="w-full h-svh bg-[#18181B] flex flex-row justify-stretch items-center overflow-hidden">
      <button
        className="md:hidden absolute left-4 top-4 z-20 p-2 rounded-lg bg-white/10 text-white"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={20} />
      </button>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      <div
        className={[
          "fixed md:relative z-40 md:z-auto",
          "flex flex-col h-full w-80 md:w-[22rem] md:max-w-[22rem]",
          "glass-dark bg-black/10 p-5 pb-7.5 gap-4",
          "transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <Button variant="ghost" size="default" className="gap-1 sm:text-md" asChild>
          <Link href="/"><ArrowLeft size={16} />Вернуться</Link>
        </Button>

        <Button variant="outline" size="default" onClick={startNewConversation}>
          + Новый чат
        </Button>

        <div className="flex-1 overflow-y-auto flex flex-col gap-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={[
                "group flex items-center gap-1 rounded-lg text-sm",
                conv.id === currentConversationId ? "bg-white/15" : "hover:bg-white/8",
              ].join(" ")}
            >
              <button
                onClick={() => loadConversation(conv.id)}
                className="flex-1 text-left px-3 py-2 min-w-0"
              >
                <div className="truncate text-white/90">{conv.title}</div>
                <div className="text-white/40 text-xs">{formatDate(conv.createdAt)}</div>
              </button>
              <button
                onClick={(e) => deleteConversation(e, conv.id)}
                className="flex-shrink-0 p-2 mr-1 rounded-md text-white/0 group-hover:text-white/30 hover:!text-white/70 transition-colors"
                title="Удалить"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {!isAuthenticated && !isGuest && (
          <Button variant="outline" size="default" className="w-full" onClick={() => setShowAuthModal(true)}>
            Войти
          </Button>
        )}

        <Button
          variant="default"
          size="default"
          className="w-full font-black text-[#18181B] active:bg-[#7B9EFF]"
          asChild
        >
          <Link href="/">Играть</Link>
        </Button>

        {!isAuthenticated && isGuest && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
            <div className="w-9 h-9 rounded-full flex-shrink-0 bg-white/10 flex items-center justify-center">
              <User size={18} className="text-white/60" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white/90 text-sm font-medium">Гость</span>
              <button
                className="text-white/40 text-xs text-left hover:text-white/60 transition-colors"
                onClick={() => setShowAuthModal(true)}
              >
                Войти в аккаунт
              </button>
            </div>
          </div>
        )}

        {isAuthenticated && (
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/8 transition-colors"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
              {userAvatar ? (
                <Image
                  src={`/avatars/${userAvatar}.png`}
                  width={36}
                  height={36}
                  alt="avatar"
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-sm font-semibold text-white">{userInitial}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white/90 text-sm font-medium truncate">{userName ?? "Профиль"}</span>
              <span className="text-white/40 text-xs">Открыть профиль</span>
            </div>
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-5 items-center justify-center px-6.25 pt-14 pb-4 md:pt-0 md:px-6.25 grow-2 h-full">
        <div
          className={`w-full max-w-3xl flex flex-col gap-5 px-2.5 sm:px-5 max-h-full overflow-y-auto transition-[flex-grow,margin] duration-300 ease-in-out ${started ? "flex-1 mt-4" : "flex-none"}`}
        >
          {started ? (
            <>
              {messageGroups.map((messageGroup, i) => (
                <div
                  className={`w-full flex flex-col gap-2.5 ${messageGroup[0].sender === "client" ? "items-end" : ""}`}
                  key={i}
                >
                  {messageGroup.map((message, j) => (
                    <MessageRender message={message} key={j} />
                  ))}
                  {messageGroup[0].sender === "server" && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {NAV_LINKS.map((link) => (
                        <Button key={link.href} variant="outline" size="sm" asChild>
                          <Link href={link.href}>{link.label}</Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {action &&
                (answerStream ? (
                  <MessageRender message={{ message: answerStream, sender: "server" }} />
                ) : (
                  <div className="text-white/50">
                    {action === "thinking" ? (
                      <span className={`transition-opacity duration-300 ${phraseVisible ? "opacity-100" : "opacity-0"}`}>
                        {thinkingPhrase}
                      </span>
                    ) : (
                      "Остановлено."
                    )}
                  </div>
                ))}
              <div className={`${action ? "scale-80" : "scale-100"} w-25 transition-transform duration-300 aspect-square relative -ml-5`}>
                <Orb resolution={4} blurMax={4} preset={orbPreset} presetTransitionMs={1200} />
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="w-50 h-50 relative"><Orb /></div>
              </div>
              <div className="text-[24px] text-center">
                <span className="text-[#7B9EFF]">{greeting}</span> Задай вопрос, и я сразу отвечу!
              </div>
            </>
          )}
        </div>

        <div className="w-full max-w-3xl flex flex-col gap-2 items-center">
          <ChatInput
            thinking={action === "thinking"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onSubmit={onSubmit}
            disabled={limitReached}
          />

          <div className="w-full flex items-center justify-between px-1">
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                className="appearance-none bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer hover:bg-white/10 transition-colors"
              >
                {MODEL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#18181B] text-white">{opt}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40" />
            </div>

            <div className="flex items-center gap-2">
              {!isAuthenticated && !isGuest && (
                <span className={`text-xs ${questionsLeft <= 1 ? "text-orange-400" : "text-white/40"}`}>
                  Осталось: {questionsLeft} из {QUESTION_LIMIT}
                </span>
              )}
              <div className="relative">
                <select
                  value={orbsTier}
                  onChange={(e) => setOrbsTier(e.target.value as OrbsTier)}
                  className="appearance-none bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer hover:bg-white/10 transition-colors"
                >
                  {ORBS_TIERS.map((tier) => (
                    <option key={tier.label} value={tier.label} className="bg-[#18181B] text-white">{tier.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#1E1E22] p-7 shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-white text-lg leading-snug">Войти через</p>
                  <p className="text-white/50 text-sm">Лимит вопросов исчерпан. Войдите, чтобы продолжить без ограничений.</p>
                </div>
                <button className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0 mt-1 text-lg leading-none" onClick={() => setShowAuthModal(false)}>✕</button>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  className="w-full gap-2 bg-[#0077FF] hover:bg-[#0066DD] text-white h-11 text-base"
                  onClick={() => { window.location.href = "/api/auth/vk?mode=login&returnUrl=/abit"; }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 flex-shrink-0">
                    <path d="m9.489.004.729-.003h3.564l.73.003.914.01.433.007.418.011.403.014.388.016.374.021.36.025.345.03.333.033c1.74.196 2.933.616 3.833 1.516.9.9 1.32 2.092 1.516 3.833l.034.333.029.346.025.36.02.373.025.588.012.41.013.644.009.915.004.98-.001 3.313-.003.73-.01.914-.007.433-.011.418-.014.403-.016.388-.021.374-.025.36-.03.345-.033.333c-.196 1.74-.616 2.933-1.516 3.833-.9.9-2.092 1.32-3.833 1.516l-.333.034-.346.029-.36.025-.373.02-.588.025-.41.012-.644.013-.915.009-.98.004-3.313-.001-.73-.003-.914-.01-.433-.007-.418-.011-.403-.014-.388-.016-.374-.021-.36-.025-.345-.03-.333-.033c-1.74-.196-2.933-.616-3.833-1.516-.9-.9-1.32-2.092-1.516-3.833l-.034-.333-.029-.346-.025-.36-.02-.373-.025-.588-.012-.41-.013-.644-.009-.915-.004-.98.001-3.313.003-.73.01-.914.007-.433.011-.418.014-.403.016-.388.021-.374.025-.36.03-.345.033-.333c.196-1.74.616-2.933 1.516-3.833.9-.9 2.092-1.32 3.833-1.516l.333-.034.346-.029.36-.025.373-.02.588-.025.41-.012.644-.013.915-.009ZM6.79 7.3H4.05c.13 6.24 3.25 9.99 8.72 9.99h.31v-3.57c2.01.2 3.53 1.67 4.14 3.57h2.84c-.78-2.84-2.83-4.41-4.11-5.01 1.28-.74 3.08-2.54 3.51-4.98h-2.58c-.56 1.98-2.22 3.78-3.8 3.95V7.3H10.5v6.92c-1.6-.4-3.62-2.34-3.71-6.92Z" />
                  </svg>
                  ВКонтакте
                </Button>
                <Button
                  className="w-full gap-2 bg-[#FC3F1D] hover:bg-[#E0380F] text-white h-11 text-base"
                  onClick={() => { window.location.href = "/api/auth/yandex?mode=login&returnUrl=/abit"; }}
                >
                  <Image src="/partners/yandex.svg" width={20} height={20} alt="yandex" className="size-5 flex-shrink-0" />
                  Яндекс
                </Button>
                <Button
                  variant="ghost"
                  className="w-full gap-2 text-white/60 hover:text-white h-11 text-base border border-white/10 hover:bg-white/5"
                  onClick={() => {
                    localStorage.setItem(GUEST_KEY, "1");
                    setIsGuest(true);
                    setShowAuthModal(false);
                  }}
                >
                  <User size={18} className="flex-shrink-0" />
                  Я гость
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MessageRender({ message }: { message: Message }) {
  const isClient = message.sender === "client";

  if (message.imageBase64) {
    return (
      <div className="max-w-sm">
        <img
          src={`data:image/jpeg;base64,${message.imageBase64}`}
          alt="Сгенерированное изображение"
          className="rounded-xl w-full object-cover"
        />
      </div>
    );
  }

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
