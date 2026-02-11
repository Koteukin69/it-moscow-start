"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type FC,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

export type ChatStep =
  | { type: "message"; text: string; sender: "client" | "server"; delay?: number }
  | { type: "input"; key: string; placeholder?: string; regex?: RegExp; error?: string; skip?: string }
  | { type: "sleep"; ms: number }
  | { type: "component"; sender?: "client" | "server"; render: (data: Record<string, string>) => ReactNode }
  | { type: "condition"; key: string; match: RegExp; then: ChatStep[]; else?: ChatStep[] };

export interface ChatProps {
  steps: ChatStep[];
  className?: string;
}

type Bubble =
  | { id: number; kind: "text"; sender: "client" | "server"; text: string }
  | { id: number; kind: "node"; sender: "client" | "server"; node: ReactNode };

const Messages: FC<{ bubbles: Bubble[] }> = ({ bubbles }) => {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [bubbles]);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-10">
      {bubbles.map((b) => (
        <div key={b.id}
             className={`flex animate-[chatFadeIn_0.3s_ease_both] ${b.sender === "client" ? "justify-end" : "justify-start"}`}>
          {b.kind === "text" ? (
            <div className={`max-w-[80%] break-words px-4 py-2.5 text-[15px] leading-normal ${
              b.sender === "client"
                ? "rounded-[18px_18px_4px_18px] bg-sidebar-primary text-sidebar-primary-foreground"
                : "rounded-[18px_18px_18px_4px] bg-card text-card-foreground"
            }`}>{b.text}</div>
          ) : (
            <div className="w-full max-w-[90%]">{b.node}</div>
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

const TypingDots: FC = () => (
  <div className="flex shrink-0 justify-start px-3 pb-3">
    <div className="flex gap-[5px] rounded-[18px_18px_18px_4px] bg-card px-4.5 py-2.5">
      {[0, 1, 2].map((i) => (
        <span key={i}
          className="inline-block size-[7px] animate-[chatDotBounce_1.2s_infinite] rounded-full bg-muted-foreground"
          style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  </div>
);

const InputBar: FC<{
  placeholder?: string;
  error?: string;
  skipLabel?: string;
  onSend: (text: string) => boolean | void;
  onSkip?: () => void;
  onChange?: () => void;
}> = ({ placeholder, error, skipLabel, onSend, onSkip, onChange }) => {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, [placeholder]);

  const send = () => {
    const t = value.trim();
    if (!t) return;
    if (onSend(t) !== false) setValue("");
  };

  return (
    <div className="shrink-0 border-t border-border px-4 py-3">
      {error && <p className="mb-2 pl-1 text-[13px] text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Input
          ref={ref}
          className={`flex-1 rounded-xl ${error ? "border-destructive" : ""}`}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => { setValue(e.target.value); onChange?.(); }}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && send()}
          placeholder={placeholder ?? "Введите сообщение..."}
        />
        <Button
          size="default"
          className="rounded-xl"
          onClick={send}
          disabled={!value.trim()}
        >➤</Button>
      </div>
      {skipLabel && (
        <Button variant="link" size="sm" className="mt-1 w-full text-muted-foreground" onClick={onSkip}>
          {skipLabel}
        </Button>
      )}
    </div>
  );
};

function tpl(text: string, data: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? `{${key}}`);
}

function flattenSteps(steps: ChatStep[], data: Record<string, string>): ChatStep[] {
  const result: ChatStep[] = [];
  for (const step of steps) {
    if (step.type === "condition") {
      const val = data[step.key] ?? "";
      result.push(...flattenSteps(val && step.match.test(val) ? step.then : (step.else ?? []), data));
    } else {
      result.push(step);
    }
  }
  return result;
}

const Chat: FC<ChatProps> = ({ steps, className }) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [typing, setTyping] = useState(false);
  const [inputStep, setInputStep] = useState<Extract<ChatStep, { type: "input" }> | null>(null);
  const [inputError, setInputError] = useState<string>();
  const data = useRef<Record<string, string>>({});
  const idx = useRef(0);
  const running = useRef(false);
  const bid = useRef(0);

  const addText = useCallback((sender: "client" | "server", text: string) => {
    setBubbles((p) => [...p, { id: bid.current++, kind: "text", sender, text: tpl(text, data.current) }]);
  }, []);

  const addNode = useCallback((sender: "client" | "server", node: ReactNode) => {
    setBubbles((p) => [...p, { id: bid.current++, kind: "node", sender, node }]);
  }, []);

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const runFrom = useCallback(async (from: number) => {
    if (running.current) return;
    running.current = true;
    const flat = flattenSteps(steps, data.current);

    for (let i = from; i < flat.length; i++) {
      idx.current = i + 1;
      const s = flat[i];

      if (s.type === "message") {
        if (s.sender === "server") { setTyping(true); await sleep(s.delay ?? 600); setTyping(false); }
        addText(s.sender, s.text);
      } else if (s.type === "sleep") {
        await sleep(s.ms);
      } else if (s.type === "input") {
        setInputStep(s);
        setInputError(undefined);
        running.current = false;
        return;
      } else if (s.type === "component") {
        addNode(s.sender ?? "server", s.render(data.current));
      }
    }
    running.current = false;
  }, [steps, addText, addNode]);

  useEffect(() => { runFrom(0); }, [runFrom]);

  const handleSend = (text: string): boolean | void => {
    if (!inputStep) return;
    if (inputStep.regex && !inputStep.regex.test(text.replace(/[\s\-()]+/g, ""))) {
      setInputError(inputStep.error ?? "Неверный формат");
      return false;
    }
    data.current[inputStep.key] = text;
    addText("client", text);
    setInputStep(null);
    setInputError(undefined);
    runFrom(idx.current);
  };

  const handleSkip = () => {
    if (!inputStep) return;
    data.current[inputStep.key] = "";
    addText("client", inputStep.skip!);
    setInputStep(null);
    setInputError(undefined);
    runFrom(idx.current);
  };

  return (
    <div className={`relative flex size-full flex-col overflow-hidden bg-background text-foreground ${className ?? ""}`}>
      <div className="flex justify-between shrink-0 items-center gap-3 border-b border-border px-5 py-4 md:hidden">
        <Button variant="link" asChild><Link href="/">Вернуться</Link></Button>
        <Image className={"max-w-10 aspect-square"} alt={"logo square"} src={"logo-square.svg"} width={64} height={64}/>
      </div>

      <Messages bubbles={bubbles} />
      {typing && <TypingDots />}

      {inputStep && (
        <InputBar
          placeholder={inputStep.placeholder}
          error={inputError}
          skipLabel={inputStep.skip}
          onSend={handleSend}
          onSkip={inputStep.skip ? handleSkip : undefined}
          onChange={() => inputError && setInputError(undefined)}
        />
      )}
    </div>
  );
};

export default Chat;