'use client';

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {LogOut, Users, CalendarDays, ShoppingBag, Coins, ClipboardList} from "lucide-react";
import UsersTab from "./users-tab";
import EventsTab from "./events-tab";
import ProductsTab from "./products-tab";
import OrdersTab from "./orders-tab";
import OrbAnimation from "@/components/orb";
import Image from "next/image";

export default function CommissionDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", {method: "POST"});
    router.push("/commission");
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="overflow-hidden fixed inset-0 -z-1 flex items-center justify-center">
        <div className="w-full h-full">
          <OrbAnimation scaleMode="max"/>
        </div>
      </div>

      <header className="border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="mx-auto px-10 sm:px-20 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo-square.svg" width={64} height={64} alt="IT.Москва" className="h-6 w-auto"/>
            <span className="text-sm text-muted-foreground hidden sm:inline">Приёмная комиссия</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut size={16}/>
            <span className="hidden sm:inline">Выйти</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto px-10 sm:px-20 py-8">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="w-full sm:w-auto bg-background/70">
            <TabsTrigger value="users" className="gap-2">
              <Users size={16}/>
              Абитуриенты
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <CalendarDays size={16}/>
              Мероприятия
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <ShoppingBag size={16}/>
              Товары
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ClipboardList size={16}/>
              Заказы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UsersTab/>
          </TabsContent>
          <TabsContent value="events" className="mt-6">
            <EventsTab/>
          </TabsContent>
          <TabsContent value="products" className="mt-6">
            <ProductsTab/>
          </TabsContent>
          <TabsContent value="orders" className="mt-6">
            <OrdersTab/>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
