'use client';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {CalendarDays} from "lucide-react";
import {type EventData} from "@/lib/types";

const HTTPS_URL_SPLIT_REGEX = /(https:\/\/[^\s]+)/g;

function renderLineWithLinks(line: string): React.ReactNode {
  const parts = line.split(HTTPS_URL_SPLIT_REGEX);
  return parts.map((part, i) =>
    part.startsWith("https://") ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">
        {part}
      </a>
    ) : part
  );
}

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
}

interface EventDetailDialogProps {
  event: EventData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EventDetailDialog({event, open, onOpenChange}: EventDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {event && (
          <>
            <DialogHeader>
              <DialogTitle>{event.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {event.image && (
                <div className="aspect-square rounded-lg overflow-hidden bg-muted/30">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {event.description.split("\n").map((line, i) => (
                <p key={i} className="text-sm text-muted-foreground">{renderLineWithLinks(line)}</p>
              ))}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays size={14}/>
                <span>{formatEventDate(event.date)}</span>
              </div>
            </div>
            <DialogFooter>
              {event.registrationUrl && (
                <Button asChild>
                  <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                    Зарегистрироваться
                  </a>
                </Button>
              )}
              <DialogClose asChild>
                <Button variant="outline">Закрыть</Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
