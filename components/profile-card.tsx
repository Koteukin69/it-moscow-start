'use client';

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {Pencil} from "lucide-react"
import { Role } from "@/lib/types";
import OrbAnimation from "@/components/orb";
import Link from "next/link";

const roleLabels: Record<Role, string> = {
  [Role.applicant]: "Абитуриент",
  [Role.parent]: "Родитель",
};

interface ProfileCardProps {
  name: string;
  phone?: string;
  role: Role;
  verified: boolean;
}

export default function ProfileCard({ name, phone, role, verified }: ProfileCardProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center h-screen px-10 sm:px-20">
      <div className="overflow-hidden absolute w-screen h-screen -z-1 flex items-center justify-center">
        <div className="h-screen aspect-square">
          <OrbAnimation />
        </div>
      </div>
      <Card className="w-full max-w-sm bg-background/70">
        <CardHeader className={"flex justify-between items-center"}>
          <h1 className="font-semibold text-center">Мой Профиль</h1>
          <h1 className="font-semibold text-center">IT.Москва Старт</h1>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-row items-center justify-between gap-1">
            <span className="text-sm text-muted-foreground">Имя</span>
            <span className="flex gap-1 items-center">
              {name}
              <Button variant={"link"} size={"icon-xs"} asChild><Link href={""}><Pencil size={"10px"}/></Link></Button>
            </span>
          </div>
          <div className="flex flex-row items-center justify-between gap-1">
            <span className="text-sm text-muted-foreground">Телефон</span>
            <span className="flex gap-1 items-center">
              {phone??"Не указан"}
              <Button variant={"link"} size={"icon-xs"} asChild><Link href={""}><Pencil size={"10px"}/></Link></Button>
            </span>
          </div>
          <div className="flex flex-row items-center justify-between gap-1">
            <span className="text-sm text-muted-foreground">Роль</span>
            <span>{roleLabels[role]}</span>
          </div>
          <div className="flex flex-row items-center justify-between gap-1">
            <span className="text-sm text-muted-foreground">Статус</span>
            <span>{verified ? "Подтверждён" : "Не подтверждён"}</span>
          </div>
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
