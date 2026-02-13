'use client';

import {useState, useEffect, useMemo} from "react";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Search, CalendarDays, Loader2, X} from "lucide-react";
import OrbAnimation from "@/components/orb";

interface EventData {
  _id: string;
  name: string;
  date: string;
  image: string | null;
  description: string;
}

function EventCard({event, upcoming = true}: {event: EventData; upcoming?: boolean}) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("ru-RU", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <Card className={`max-w-sm bg-background/50 ${!upcoming ? "opacity-60" : ""}`}>
      <CardContent className="flex flex-col gap-2">
        <h3 className="font-semibold">{event.name}</h3>
        <p className="text-sm">{event.description}</p>
        {event.image && (
          <img
            src={event.image}
            alt={event.name}
            className="w-full aspect-square object-cover rounded-lg"
          />
        )}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
          <Badge variant={upcoming ? "default" : "secondary"} className="shrink-0 text-xs">
            {upcoming ? "Скоро" : "Прошло"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EventsCalendar() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

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

  const filtered = useMemo(() => {
    let result = events;

    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    }

    if (selectedDate) {
      result = result.filter(e => {
        const d = new Date(e.date);
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        );
      });
    }

    return result;
  }, [events, search, selectedDate]);

  const now = new Date();
  const upcoming = filtered.filter(e => new Date(e.date) >= now);
  const past = filtered.filter(e => new Date(e.date) < now).reverse();

  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-10 pt-16 pb-10 overflow-x-hidden">
      <div className="overflow-hidden fixed inset-0 -z-1 flex items-center justify-center">
        <div className="h-full aspect-square">
          <OrbAnimation/>
        </div>
      </div>

      <Card className="w-full max-w-2xl bg-background/70 animate-[chatFadeIn_0.3s_ease_both]">
        <CardHeader>
          <h1 className="text-xl font-semibold">Мероприятия</h1>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 h-[50vh] overflow-y-scroll">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
              <Input
                placeholder="Поиск по названию или описанию..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={selectedDate ? "default" : "outline"} size="icon">
                  <CalendarDays size={16}/>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                />
              </PopoverContent>
            </Popover>
            {selectedDate && (
              <Button variant="ghost" size="icon" onClick={() => setSelectedDate(undefined)}>
                <X size={16}/>
              </Button>
            )}
          </div>

          {selectedDate && (
            <Badge variant="secondary" className="w-fit">
              {selectedDate.toLocaleDateString("ru-RU", {day: "numeric", month: "long", year: "numeric"})}
            </Badge>
          )}

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-muted-foreground"/>
            </div>
          )}

          {!loading && upcoming.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-muted-foreground">Предстоящие</h2>
              <div className={"grid grid-cols-1 sm:grid-cols-2 gap-x-3"}>
                {upcoming.map(event => (
                  <EventCard key={event._id} event={event}/>
                ))}
              </div>
            </div>
          )}

          {!loading && past.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-muted-foreground">Прошедшие</h2>
              <div className={"grid grid-cols-1 sm:grid-cols-2 gap-x-3"}>
                {past.map(event => (
                  <EventCard key={event._id} event={event} upcoming={false}/>
                ))}
              </div>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <CalendarDays size={24}/>
              <span>{search || selectedDate ? "Ничего не найдено" : "Нет мероприятий"}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
