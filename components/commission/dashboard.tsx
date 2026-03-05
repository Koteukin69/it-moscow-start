'use client';

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {LogOut, Users, CalendarDays, ShoppingBag, ClipboardList, MessageSquare, Megaphone, HelpCircle} from "lucide-react";
import UsersTab from "./users-tab";
import EventsTab from "./events-tab";
import ProductsTab from "./products-tab";
import OrdersTab from "./orders-tab";
import ConsultationsTab from "./consultations-tab";
import PopupTab from "./popup-tab";
import FaqTab from "./faq-tab";
import OrbAnimation from "@/components/orb";
import Image from "next/image";

export default function CommissionDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/commission/logout", {method: "POST"});
    router.push("/commission");
  };

  return (
    <div className="min-h-dvh overflow-x-hidden">
      <div className="overflow-hidden fixed inset-0 -z-1 flex items-center justify-center">
        <div className="w-full h-full">
          <OrbAnimation scaleMode="max"/>
        </div>
      </div>

      <header className="border-b border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto px-4 sm:px-10 md:px-20 h-18 flex items-center justify-between">
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

      <main className="mx-auto px-2 sm:px-10 md:px-20 py-4 sm:py-8">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="w-full sm:w-auto bg-background/70">
            <TabsTrigger value="users" className="gap-1.5">
              <Users size={16}/>
              <span className="hidden sm:inline">Абитуриенты</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1.5">
              <CalendarDays size={16}/>
              <span className="hidden sm:inline">Мероприятия</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5">
              <ShoppingBag size={16}/>
              <span className="hidden sm:inline">Товары</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5">
              <ClipboardList size={16}/>
              <span className="hidden sm:inline">Заказы</span>
            </TabsTrigger>
            <TabsTrigger value="consultations" className="gap-1.5">
              <MessageSquare size={16}/>
              <span className="hidden sm:inline">Консультации</span>
            </TabsTrigger>
            <TabsTrigger value="popup" className="gap-1.5">
              <Megaphone size={16}/>
              <span className="hidden sm:inline">Попап</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="gap-1.5">
              <HelpCircle size={16}/>
              <span className="hidden sm:inline">FAQ</span>
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
          <TabsContent value="consultations" className="mt-6">
            <ConsultationsTab/>
          </TabsContent>
          <TabsContent value="popup" className="mt-6">
            <PopupTab/>
          </TabsContent>
          <TabsContent value="faq" className="mt-6">
            <FaqTab/>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
