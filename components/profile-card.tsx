'use client';

import {useState, useRef, useEffect, useCallback} from "react";
import {useRouter} from "next/navigation";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Popover, PopoverTrigger, PopoverContent} from "@/components/ui/popover";
import {Pencil, Check, X, Loader2, Coins, LogOut, BadgeCheck, Brain, ChevronRight, ShoppingBag, Link2, Unlink} from "lucide-react";
import type {UserOrder} from "@/app/profile/page";
import type {QuizResult} from "@/lib/types";
import OrbAnimation from "@/components/orb";
import Image from "next/image";
import Link from "next/link";
import {cn} from "@/lib/utils";

type EditStatus = "editing" | "loading" | "success" | "error";

function useInlineEdit(initialValue: string, field: "name", onSaved: (value: string) => void) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<EditStatus>("editing");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active && status === "editing") inputRef.current?.focus();
  }, [active, status]);

  const isValid = value.trim().length > 0;

  const startEdit = useCallback(() => {
    setValue(initialValue);
    setStatus("editing");
    setActive(true);
  }, [initialValue]);

  const submit = useCallback(async () => {
    if (!isValid) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({field, value}),
      });
      if (res.ok) {
        const data = await res.json();
        onSaved(data.value ?? value);
        setStatus("success");
        setTimeout(() => {
          setActive(false);
          setStatus("editing");
        }, 600);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, [field, value, isValid, onSaved]);

  const dismiss = useCallback(() => {
    setActive(false);
    setStatus("editing");
  }, []);

  return {active, value, setValue, status, isValid, inputRef, startEdit, submit, dismiss};
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");
}

const AVATAR_IDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

interface OAuthProviderInfo {
  provider: "vk" | "yandex";
  linkedAt: string;
}

interface ProfileCardProps {
  name: string;
  verified: boolean;
  coins: number;
  avatar?: string;
  quizResult?: QuizResult;
  orders?: UserOrder[];
  oauthProviders: OAuthProviderInfo[];
}

const PROVIDER_META = {
  vk: {
    label: "ВКонтакте",
    bg: "bg-[#0077FF]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
        <path d="m9.489.004.729-.003h3.564l.73.003.914.01.433.007.418.011.403.014.388.016.374.021.36.025.345.03.333.033c1.74.196 2.933.616 3.833 1.516.9.9 1.32 2.092 1.516 3.833l.034.333.029.346.025.36.02.373.025.588.012.41.013.644.009.915.004.98-.001 3.313-.003.73-.01.914-.007.433-.011.418-.014.403-.016.388-.021.374-.025.36-.03.345-.033.333c-.196 1.74-.616 2.933-1.516 3.833-.9.9-2.092 1.32-3.833 1.516l-.333.034-.346.029-.36.025-.373.02-.588.025-.41.012-.644.013-.915.009-.98.004-3.313-.001-.73-.003-.914-.01-.433-.007-.418-.011-.403-.014-.388-.016-.374-.021-.36-.025-.345-.03-.333-.033c-1.74-.196-2.933-.616-3.833-1.516-.9-.9-1.32-2.092-1.516-3.833l-.034-.333-.029-.346-.025-.36-.02-.373-.025-.588-.012-.41-.013-.644-.009-.915-.004-.98.001-3.313.003-.73.01-.914.007-.433.011-.418.014-.403.016-.388.021-.374.025-.36.03-.345.033-.333c.196-1.74.616-2.933 1.516-3.833.9-.9 2.092-1.32 3.833-1.516l.333-.034.346-.029.36-.025.373-.02.588-.025.41-.012.644-.013.915-.009ZM6.79 7.3H4.05c.13 6.24 3.25 9.99 8.72 9.99h.31v-3.57c2.01.2 3.53 1.67 4.14 3.57h2.84c-.78-2.84-2.83-4.41-4.11-5.01 1.28-.74 3.08-2.54 3.51-4.98h-2.58c-.56 1.98-2.22 3.78-3.8 3.95V7.3H10.5v6.92c-1.6-.4-3.62-2.34-3.71-6.92Z"/>
      </svg>
    ),
  },
  yandex: {
    label: "Яндекс",
    bg: "bg-[#FC3F1D]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.2 5.4h-1.44c-2.16 0-4.32 1.2-4.32 3.96 0 1.68.84 2.88 2.28 3.72l-2.64 4.92h2.16l2.4-4.56h.12V18h1.92V5.4h-.48zm-.48 6.36h-.24c-1.2 0-2.4-.72-2.4-2.4 0-1.68 1.08-2.4 2.4-2.4h.24v4.8z"/>
      </svg>
    ),
  },
} as const;

export default function ProfileCard({name: initialName, verified, coins, avatar: initialAvatar, quizResult, orders = [], oauthProviders: initialProviders}: ProfileCardProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialName);
  const [displayAvatar, setDisplayAvatar] = useState(initialAvatar);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState<string | null>(null);
  const [providers, setProviders] = useState(initialProviders);
  const [unlinking, setUnlinking] = useState<string | null>(null);

  const nameEdit = useInlineEdit(displayName, "name", (v) => {
    setDisplayName(v);
    router.refresh();
  });

  const handleLogout = async () => {
    await fetch('/api/logout', {method: 'POST'});
    router.push('/');
  };

  const handleAvatarSelect = async (id: string) => {
    setAvatarSaving(id);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({field: "avatar", value: id}),
      });
      if (res.ok) {
        setDisplayAvatar(id);
        setAvatarOpen(false);
      }
    } catch { /* ignore */ }
    setAvatarSaving(null);
  };

  const handleUnlink = async (provider: "vk" | "yandex") => {
    setUnlinking(provider);
    try {
      const res = await fetch("/api/auth/unlink", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({provider}),
      });
      if (res.ok) {
        setProviders(prev => prev.filter(p => p.provider !== provider));
      }
    } catch { /* ignore */ }
    setUnlinking(null);
  };

  const linkedProviders = new Set(providers.map(p => p.provider));

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 sm:px-10 py-16 overflow-y-auto">
      <div className="overflow-hidden fixed inset-0 -z-1 flex items-center justify-center">
        <div className="w-full h-full">
          <OrbAnimation scaleMode="max"/>
        </div>
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-4">
        <Card className="bg-background/70 border-border/40">
          <CardContent className="flex flex-col sm:flex-row items-center gap-5 p-6">
            <Popover open={avatarOpen} onOpenChange={setAvatarOpen}>
              <PopoverTrigger asChild>
                <button className="group relative shrink-0 w-20 h-20 rounded-full overflow-hidden cursor-pointer">
                  {displayAvatar ? (
                    <Image
                      src={`/avatars/${displayAvatar}.png`}
                      alt="Аватар"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-primary/80 to-primary/30 flex items-center justify-center text-2xl font-bold text-primary-foreground select-none">
                      {getInitials(displayName) || "?"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Pencil size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity"/>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-3">
                <p className="text-sm font-medium mb-2">Выберите аватар</p>
                <div className="grid grid-cols-3 gap-2">
                  {AVATAR_IDS.map(id => (
                    <button
                      key={id}
                      onClick={() => handleAvatarSelect(id)}
                      disabled={avatarSaving !== null}
                      className={cn(
                        "relative w-16 h-16 rounded-full overflow-hidden cursor-pointer transition-all hover:scale-105",
                        "ring-2 ring-offset-2 ring-offset-popover",
                        displayAvatar === id ? "ring-primary" : "ring-transparent hover:ring-muted-foreground/30",
                        avatarSaving === id && "opacity-60"
                      )}
                    >
                      <Image
                        src={`/avatars/${id}.png`}
                        alt={`Аватар ${id}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                      {avatarSaving === id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Loader2 size={16} className="text-white animate-spin"/>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex-1 min-w-0 flex flex-col gap-2 items-center sm:items-start w-full">
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <InlineNameField displayValue={displayName} edit={nameEdit}/>
                <Badge variant={verified ? "default" : "secondary"} className="gap-1 shrink-0">
                  <BadgeCheck size={12}/>
                  {verified ? "Подтверждён" : "Не подтверждён"}
                </Badge>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
              onClick={handleLogout}
            >
              <LogOut size={14}/>
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-background/70 border-border/40 py-0">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Link2 size={18}/>
              <span className="text-sm font-medium">Привязанные аккаунты</span>
            </div>
            {(["vk", "yandex"] as const).map(provider => {
              const meta = PROVIDER_META[provider];
              const isLinked = linkedProviders.has(provider);
              const isUnlinking = unlinking === provider;

              return (
                <div key={provider} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("flex items-center justify-center w-8 h-8 rounded-full text-white", meta.bg)}>
                      {meta.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{meta.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {isLinked ? "Привязан" : "Не привязан"}
                      </p>
                    </div>
                  </div>
                  {isLinked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={providers.length <= 1 || isUnlinking}
                      onClick={() => handleUnlink(provider)}
                    >
                      {isUnlinking ? <Loader2 size={14} className="animate-spin"/> : <Unlink size={14}/>}
                      Отвязать
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <a href={`/api/auth/${provider}?mode=link`}>
                        <Link2 size={14}/>
                        Привязать
                      </a>
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-background/70 border-border/40 transition-all hover:shadow-lg h-full py-0">
            <CardContent className="p-4 flex flex-col h-full gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Coins size={18} className="text-yellow-500"/>
                  <span className="text-sm font-medium">Монетки</span>
                </div>
                <span className="text-3xl font-bold tabular-nums">{coins}</span>
              </div>
              <div className="flex flex-col w-full gap-2">
                <Button variant="default" className="w-full rounded-xl gap-2 mt-auto" asChild>
                  <Link href="/game">
                    Играть
                  </Link>
                </Button>
                <Button variant="outline" className="w-full rounded-xl gap-2 mt-auto" asChild>
                  <Link href="/shop">
                    Потратить в магазине
                    <ChevronRight size={16}/>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/70 border-border/40 transition-all hover:shadow-lg h-full py-0">
            <CardContent className="p-4 flex flex-col h-full gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Brain size={18}/>
                <span className="text-sm font-medium">Тест: Кто ты в IT?</span>
              </div>
              {quizResult ? (
                <div className="flex flex-col gap-1.5">
                  {quizResult.top.map((dir, idx) => (
                    <div key={dir} className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground w-4 text-right">{idx + 1}.</span>
                      <span className="text-sm">{dir}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Узнай, какое IT-направление тебе подходит</p>
              )}
              <Button variant="outline" className="w-full rounded-xl gap-2 mt-auto" asChild>
                <Link href="/quiz">
                  {quizResult ? "Пройти заново" : "Пройти тест"}
                  <ChevronRight size={16}/>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {orders.length > 0 && (
          <Card className="bg-background/70 border-border/40 py-0">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShoppingBag size={18}/>
                <span className="text-sm font-medium">Мои заказы</span>
              </div>
              <div className="space-y-2">
                {orders.map(order => (
                  <OrderRow key={order._id} order={order}/>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}

function InlineNameField({displayValue, edit}: {displayValue: string; edit: ReturnType<typeof useInlineEdit>}) {
  if (!edit.active) {
    return (
      <button onClick={edit.startEdit} className="group flex items-center gap-1.5 cursor-pointer">
        <h1 className="text-xl font-bold truncate">{displayValue}</h1>
        <Pencil size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"/>
      </button>
    );
  }

  return (
    <span className="flex gap-1.5 items-center animate-[chatFadeIn_0.2s_ease_both]">
      {edit.status === "error" ? (
        <>
          <span className="text-sm text-destructive">Ошибка</span>
          <Button variant="ghost" size="icon-xs" className="text-destructive" onClick={edit.dismiss}>
            <X size={12}/>
          </Button>
        </>
      ) : (
        <>
          <Input
            ref={edit.inputRef}
            className="h-8 text-sm rounded-lg w-44"
            value={edit.value}
            onChange={(e) => edit.setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && edit.isValid && edit.submit()}
            placeholder="Введите имя"
            disabled={edit.status === "loading" || edit.status === "success"}
          />
          <Button
            variant="ghost"
            size="icon-xs"
            className={edit.status === "success" ? "text-primary" : ""}
            onClick={edit.submit}
            disabled={!edit.isValid || edit.status === "loading" || edit.status === "success"}
          >
            {edit.status === "loading" ? <Loader2 size={12} className="animate-spin"/> : <Check size={12}/>}
          </Button>
        </>
      )}
    </span>
  );
}

const orderStatusConfig: Record<string, {label: string; variant: "default" | "secondary" | "destructive" | "outline"}> = {
  pending: {label: "Ожидает выдачи", variant: "outline"},
  completed: {label: "Выдан", variant: "default"},
  cancelled: {label: "Отменён", variant: "destructive"},
};

function OrderRow({order}: {order: UserOrder}) {
  const st = orderStatusConfig[order.status];
  const isPending = order.status === "pending";

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-lg border p-3",
      isPending ? "bg-background" : "bg-muted/30"
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground">#{order.orderNumber}</span>
          <span className="text-sm font-medium truncate">{order.productName}</span>
          {order.variant && <span className="text-xs text-muted-foreground">({order.variant})</span>}
          {order.quantity > 1 && <span className="text-xs text-muted-foreground">&times;{order.quantity}</span>}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={st.variant} className="text-[10px] h-5">{st.label}</Badge>
        </div>
      </div>
      <div className={cn(
        "shrink-0 text-right",
        isPending ? "text-foreground" : "text-muted-foreground/40"
      )}>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Код выдачи</div>
        <div className={cn(
          "font-mono tracking-[0.15em]",
          isPending ? "text-xl font-bold" : "text-base"
        )}>{order.pickupCode}</div>
      </div>
    </div>
  );
}
