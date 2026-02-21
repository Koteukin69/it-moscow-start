'use client';

import {useState, useEffect} from "react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Loader2, CalendarDays} from "lucide-react";
import OrbAnimation from "@/components/orb";
import MonthCalendar from "@/components/events/month-calendar";
import VkFeed from "@/components/events/vk-feed";
import EventDetailDialog from "@/components/events/event-detail-dialog";
import EventListDialog from "@/components/events/event-list-dialog";

interface EventData {
  _id: string;
  name: string;
  date: string;
  image: string | null;
  description: string;
}

export default function EventsCalendar() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<EventData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const handleDayClick = (date: Date, dayEvents: EventData[]) => {
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0]);
      setDetailOpen(true);
    } else if (dayEvents.length > 1) {
      setSelectedDayEvents(dayEvents);
      setSelectedDate(date);
      setListOpen(true);
    }
  };

  const handleEventSelectFromList = (event: EventData) => {
    setListOpen(false);
    setSelectedEvent(event);
    setDetailOpen(true);
  };

  return (
    <div className="min-h-dvh px-10 sm:px-20 pt-30 pb-10">
      <div className="overflow-hidden fixed -inset-10 -z-1 flex items-center justify-center">
        <OrbAnimation/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] lg:h-[calc(100vh-10rem)] gap-6 mx-auto animate-[chatFadeIn_0.3s_ease_both]">
        <Card className="bg-background/70 flex flex-col overflow-hidden h-fit">
          <CardHeader className="shrink-0">
            <h1 className="text-xl font-semibold">Мероприятия</h1>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={24} className="animate-spin text-muted-foreground"/>
              </div>
            ) : (
              <MonthCalendar events={events} onDayClick={handleDayClick}/>
            )}
          </CardContent>
        </Card>

        <Card className="bg-background/70 flex flex-col overflow-hidden">
          <CardHeader className="shrink-0">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarDays size={18}/>
              Новости сообщества
            </h2>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <VkFeed/>
          </CardContent>
        </Card>
      </div>

      <EventDetailDialog
        event={selectedEvent}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <EventListDialog
        events={selectedDayEvents}
        date={selectedDate}
        open={listOpen}
        onOpenChange={setListOpen}
        onEventSelect={handleEventSelectFromList}
      />
    </div>
  );
}
