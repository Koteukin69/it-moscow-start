'use client';

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import Nav from "@/components/nav";
import OrbAnimation from "@/components/orb";
import {Loader2} from "lucide-react";
import Image from "next/image";

export default function CommissionLogin() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/commission/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({login, password}),
      });
      if (res.ok) {
        router.refresh();
        router.push("/commission/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Ошибка входа");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex align-center h-screen">
      <div className="overflow-hidden absolute -inset-x-[20%] w-screen h-screen -z-1 flex items-center justify-start">
        <div className="h-screen aspect-square"><OrbAnimation/></div>
      </div>
      <div className="w-full max-w-sm hidden md:flex">
        <Nav/>
      </div>
      <div className="flex items-center justify-center w-full px-10 sm:px-20">
      <Card className="w-full max-w-sm bg-background/70">
        <CardHeader className="flex flex-col items-center gap-3">
          <Image className="w-[80%] aspect-18258/9871" src="logo.svg" width={18258} height={9871} alt="logo"/>
          <h1 className="font-semibold text-center text-lg">Приёмная комиссия</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              placeholder="Логин"
              value={login}
              onChange={e => setLogin(e.target.value)}
              autoComplete="username"
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" disabled={loading || !login || !password} className="w-full">
              {loading ? <Loader2 className="animate-spin" size={18}/> : "Войти"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
