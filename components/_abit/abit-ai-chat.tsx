"use client";

import {useEffect, useMemo, useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {ABIT_MAX_MESSAGE_LENGTH, ABIT_TOO_MANY_REQUESTS_MESSAGE, type AbitChatMessage} from "@/lib/abit-chat";

const TOKEN_STORAGE_KEY = "abit-chat-token";
const CHAT_ERROR_MESSAGE = "Не удалось отправить сообщение. Попробуйте ещё раз.";

function getOrCreateToken(): string {
  const existing = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const token = crypto.randomUUID();
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  return token;
}

export default function AbitAiChat() {
  const [token, setToken] = useState<string>("");
  const [messages, setMessages] = useState<AbitChatMessage[]>([]);
  const [draft, setDraft] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const chatToken = getOrCreateToken();
    setToken(chatToken);

    const loadChat = async () => {
      const response = await fetch(`/api/abit/chat?token=${encodeURIComponent(chatToken)}`);
      if (!response.ok) {
        return;
      }

      const payload = await response.json() as {messages?: AbitChatMessage[]; pendingText?: string};
      setMessages(payload.messages ?? []);
      setDraft((payload.pendingText ?? "").slice(0, ABIT_MAX_MESSAGE_LENGTH));
    };

    void loadChat();
  }, []);

  const remaining = useMemo(() => ABIT_MAX_MESSAGE_LENGTH - draft.length, [draft.length]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || isLoading || !token) {
      return;
    }

    setIsLoading(true);
    setError("");

    const userMessage: AbitChatMessage = {role: "user", text, createdAt: new Date().toISOString()};
    setMessages((prev) => [...prev, userMessage]);
    setDraft("");

    try {
      const response = await fetch("/api/abit/chat", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({token, text, pendingText: ""}),
      });

      const payload = await response.json() as {reply?: string; error?: string};

      if (!response.ok) {
        setError(payload.error ?? CHAT_ERROR_MESSAGE);
        return;
      }

      const assistantMessage: AbitChatMessage = {
        role: "assistant",
        text: payload.reply ?? CHAT_ERROR_MESSAGE,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setError(CHAT_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
      <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={`${message.createdAt}-${index}`}
            className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${message.role === "user" ? "ml-auto bg-sidebar-primary text-sidebar-primary-foreground" : "bg-background"}`}
          >
            {message.text}
          </div>
        ))}
        {isLoading && <div className="max-w-[90%] rounded-2xl bg-background px-3 py-2 text-sm">...</div>}
      </div>
      <Input
        value={draft}
        maxLength={ABIT_MAX_MESSAGE_LENGTH}
        onChange={(event) => {
          setDraft(event.target.value.slice(0, ABIT_MAX_MESSAGE_LENGTH));
          if (error) {
            setError("");
          }
        }}
        placeholder="Напишите вопрос"
        disabled={isLoading}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Осталось символов: {remaining}</p>
        <Button onClick={submit} disabled={isLoading || !draft.trim()}>
          Отправить
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive">
          {error === ABIT_TOO_MANY_REQUESTS_MESSAGE ? ABIT_TOO_MANY_REQUESTS_MESSAGE : error}
        </p>
      )}
    </div>
  );
}
