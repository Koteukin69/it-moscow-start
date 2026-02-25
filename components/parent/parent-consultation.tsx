'use client';

import {useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {CheckCircle, Loader2, Phone, User} from "lucide-react";

type FormState = "idle" | "loading" | "success" | "error";

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  let normalized = digits;
  if (normalized.startsWith("8")) {
    normalized = "7" + normalized.slice(1);
  }
  if (!normalized.startsWith("7")) {
    normalized = "7" + normalized;
  }

  const d = normalized.slice(0, 11);
  if (d.length <= 1) return "+7";
  if (d.length <= 4) return `+7 (${d.slice(1)}`;
  if (d.length <= 7) return `+7 (${d.slice(1, 4)}) ${d.slice(4)}`;
  if (d.length <= 9) return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
}

export default function ParentConsultation() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setPhone(formatPhone(raw));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");
    setErrorMessage("");

    const rawPhone = phone.replace(/\D/g, "");
    const normalizedPhone = rawPhone.startsWith("8")
      ? "+7" + rawPhone.slice(1)
      : "+" + rawPhone;

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name: name.trim(), phone: normalizedPhone}),
      });

      const data = await res.json();

      if (res.ok) {
        setFormState("success");
      } else {
        setErrorMessage(data.error || "Произошла ошибка. Попробуйте ещё раз.");
        setFormState("error");
      }
    } catch {
      setErrorMessage("Ошибка сети. Проверьте соединение и попробуйте ещё раз.");
      setFormState("error");
    }
  };

  if (formState === "success") {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-10">
        <Card className="mx-auto max-w-lg">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle className="size-8"/>
            </div>
            <h3 className="text-xl font-bold">Заявка отправлена!</h3>
            <p className="text-muted-foreground">
              Наш менеджер свяжется с вами в ближайшее время
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setFormState("idle");
                setName("");
                setPhone("");
              }}
            >
              Отправить ещё одну заявку
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section id="consultation" className="mx-auto max-w-6xl px-4 py-20 sm:px-10">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Запишитесь на консультацию
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Оставьте контакты, и наш специалист приёмной комиссии ответит на все ваши вопросы
        </p>
      </div>

      <Card className="mx-auto max-w-lg">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="consultation-name">ФИО</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                <Input
                  id="consultation-name"
                  type="text"
                  placeholder="Иванов Иван Иванович"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="pl-9"
                  required
                  disabled={formState === "loading"}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="consultation-phone">Номер телефона</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                <Input
                  id="consultation-phone"
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="pl-9"
                  required
                  disabled={formState === "loading"}
                />
              </div>
            </div>

            {formState === "error" && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}

            <Button
              type="submit"
              disabled={formState === "loading" || !name.trim() || phone.replace(/\D/g, "").length < 11}
              className="w-full"
            >
              {formState === "loading" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin"/>
                  Отправка...
                </>
              ) : (
                "Записаться на консультацию"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
