'use client';

import {useState, useMemo} from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameDay, isSameMonth,
  isToday, addMonths, subMonths,
} from "date-fns";
import {ru} from "date-fns/locale/ru";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {cn} from "@/lib/utils";

interface EventData {
  _id: string;
  name: string;
  date: string;
  image: string | null;
  description: string;
}

interface MonthCalendarProps {
  events: EventData[];
  onDayClick: (date: Date, dayEvents: EventData[]) => void;
}

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function getDayGradient(date: Date): string {
  const seed = date.getDate() * 31 + date.getMonth() * 373 + date.getFullYear();
  const hue1 = seed % 360;
  const hue2 = (seed * 7 + 120) % 360;
  const angle = (seed * 13) % 180;
  return `linear-gradient(${angle}deg, hsl(${hue1}, 70%, 40%), hsl(${hue2}, 60%, 50%))`;
}

export default function MonthCalendar({events, onDayClick}: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, {weekStartsOn: 1});
    const calendarEnd = endOfWeek(monthEnd, {weekStartsOn: 1});
    return eachDayOfInterval({start: calendarStart, end: calendarEnd});
  }, [currentMonth]);

  const eventsMap = useMemo(() => {
    const map = new Map<string, EventData[]>();
    for (const event of events) {
      const d = new Date(event.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) || [];
      arr.push(event);
      map.set(key, arr);
    }
    return map;
  }, [events]);

  const getEventsForDay = (date: Date): EventData[] => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return eventsMap.get(key) || [];
  };

  const monthLabel = format(currentMonth, "LLLL yyyy", {locale: ru});

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
          aria-label="Предыдущий месяц"
        >
          <ChevronLeft size={18}/>
        </Button>
        <h2 className="text-lg font-semibold capitalize">{monthLabel}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
          aria-label="Следующий месяц"
        >
          <ChevronRight size={18}/>
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 bg-muted/40 rounded-md py-1.5">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const hasEvents = dayEvents.length > 0;
          const singleEvent = dayEvents.length === 1;
          const multiEvents = dayEvents.length >= 2;
          const singleImage = singleEvent && dayEvents[0].image;

          return (
            <button
              key={day.toISOString()}
              type="button"
              className={cn(
                "relative aspect-square rounded-md overflow-hidden transition-all",
                "flex items-end justify-start p-1",
                !inMonth && "opacity-30 pointer-events-none",
                inMonth && !hasEvents && "bg-muted/40",
                today && "ring-2 ring-primary",
                hasEvents && "cursor-pointer hover:scale-[1.03] hover:shadow-md",
                !hasEvents && "cursor-default",
                !hasEvents && inMonth && "hover:bg-accent/30",
                singleEvent && !singleImage && "bg-primary/20",
              )}
              style={
                singleImage
                  ? {backgroundImage: `url(${dayEvents[0].image})`, backgroundSize: "cover", backgroundPosition: "center"}
                  : multiEvents
                    ? {backgroundImage: getDayGradient(day)}
                    : undefined
              }
              onClick={() => hasEvents && onDayClick(day, dayEvents)}
              disabled={!hasEvents || !inMonth}
              aria-label={`${format(day, "d MMMM", {locale: ru})}${hasEvents ? `, ${dayEvents.length} мероприятий` : ""}`}
            >
              {hasEvents && (
                <div className="absolute inset-0 bg-black/30"/>
              )}
              <span className={cn(
                "relative z-10 text-xs font-medium",
                hasEvents ? "text-white" : "text-foreground",
              )}>
                {format(day, "d")}
              </span>
              {multiEvents && (
                <Badge className="absolute top-1 right-1 z-10 text-[10px] px-1 py-0" variant="secondary">
                  {dayEvents.length}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
