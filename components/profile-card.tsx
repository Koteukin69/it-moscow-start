'use client';

import {useState, useRef, useEffect, useCallback} from "react";
import {useRouter} from "next/navigation";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Pencil, Check, X, Loader2} from "lucide-react";
import {Role, type QuizResult} from "@/lib/types";
import {phoneRegex} from "@/lib/validator";
import OrbAnimation from "@/components/orb";
import Link from "next/link";

const roleLabels: Record<Role, string> = {
  [Role.applicant]: "Абитуриент",
  [Role.parent]: "Родитель",
  [Role.commission]: "Приёмная комиссия",
};

type EditField = "name" | "phone";
type EditStatus = "editing" | "loading" | "success" | "error";

function useInlineEdit(initialValue: string, field: EditField, onSaved: (value: string) => void) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<EditStatus>("editing");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active && status === "editing") inputRef.current?.focus();
  }, [active, status]);

  const isValid = field === "name"
    ? value.trim().length > 0
    : value === "" || phoneRegex.test(value.replace(/[\s\-()]+/g, ""));

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

interface ProfileCardProps {
  name: string;
  phone?: string;
  role: Role;
  verified: boolean;
  quizResult?: QuizResult;
}

export default function ProfileCard({name: initialName, phone: initialPhone, role, verified, quizResult}: ProfileCardProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialName);
  const [displayPhone, setDisplayPhone] = useState(initialPhone);

  const nameEdit = useInlineEdit(displayName, "name", (v) => {
    setDisplayName(v);
    router.refresh();
  });

  const phoneEdit = useInlineEdit(displayPhone ?? "", "phone", (v) => {
    setDisplayPhone(v || undefined);
    router.refresh();
  });

  const handleLogout = async () => {
    await fetch('/api/logout', {method: 'POST'});
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center h-screen px-10 sm:px-20">
      <div className="overflow-hidden absolute w-screen h-screen -z-1 flex items-center justify-center">
        <div className="h-screen aspect-square">
          <OrbAnimation/>
        </div>
      </div>
      <Card className="w-full max-w-sm bg-background/70">
        <CardHeader className={"flex justify-between items-center"}>
          <h1 className="font-semibold text-center">Мой Профиль</h1>
          <h1 className="font-semibold text-center">IT.Москва Старт</h1>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <EditableField
            label="Имя"
            displayValue={displayName}
            edit={nameEdit}
            placeholder="Введите имя"
          />
          <EditableField
            label="Телефон"
            displayValue={displayPhone ?? "Не указан"}
            edit={phoneEdit}
            placeholder="+79123456789"
          />
          <div className="flex flex-row items-center justify-between gap-1">
            <span className="text-sm text-muted-foreground">Роль</span>
            <span>{roleLabels[role]}</span>
          </div>
          <div className="flex flex-row items-center justify-between gap-1">
            <span className="text-sm text-muted-foreground">Статус</span>
            <span>{verified ? "Подтверждён" : "Не подтверждён"}</span>
          </div>
        </CardContent>
        <CardContent className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Тест: Кто ты в IT?</span>
          {quizResult ? (
            <div className="flex flex-col gap-1">
              {quizResult.top.map((dir, idx) => (
                <span key={dir} className="text-sm">{idx + 1}. {dir}</span>
              ))}
              <Button variant="link" size="sm" className="w-fit p-0 h-auto text-muted-foreground" asChild>
                <Link href="/quiz">Пройти заново</Link>
              </Button>
            </div>
          ) : (
            <Button variant="link" size="sm" className="w-fit p-0 h-auto" asChild>
              <Link href="/quiz">Пройти тест</Link>
            </Button>
          )}
        </CardContent>
        <CardContent>
          <Button variant="destructive" className="mt-4 rounded-xl w-full" onClick={handleLogout}>
            Выйти
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface EditableFieldProps {
  label: string;
  displayValue: string;
  edit: ReturnType<typeof useInlineEdit>;
  placeholder?: string;
}

function EditableField({label, displayValue, edit, placeholder}: EditableFieldProps) {
  if (!edit.active) {
    return (
      <div className="flex flex-row items-center justify-between gap-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="flex gap-1 items-center">
          {displayValue}
          <Button variant={"link"} size={"icon-xs"} onClick={edit.startEdit}>
            <Pencil size={"10px"}/>
          </Button>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center justify-between gap-1 animate-[chatFadeIn_0.2s_ease_both]">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="flex gap-1 items-center">
        {edit.status === "error" ? (
          <>
            <span className="text-sm text-destructive">Ошибка</span>
            <Button variant="ghost" size="icon-xs" className="text-destructive" onClick={edit.dismiss}>
              <X size="12px"/>
            </Button>
          </>
        ) : (
          <>
            <Input
              ref={edit.inputRef}
              className="h-7 text-sm text-right rounded-lg w-40"
              value={edit.value}
              onChange={(e) => edit.setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && edit.isValid && edit.submit()}
              placeholder={placeholder}
              disabled={edit.status === "loading" || edit.status === "success"}
            />
            <Button
              variant="ghost"
              size="icon-xs"
              className={edit.status === "success" ? "text-primary" : ""}
              onClick={edit.submit}
              disabled={!edit.isValid || edit.status === "loading" || edit.status === "success"}
            >
              {edit.status === "loading"
                ? <Loader2 size="12px" className="animate-spin"/>
                : <Check size="12px"/>
              }
            </Button>
          </>
        )}
      </span>
    </div>
  );
}
