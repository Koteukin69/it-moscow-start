'use client';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {CalendarDays} from "lucide-react";

interface EventData {
  _id: string;
  name: string;
  date: string;
  image: string | null;
  description: string;
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
              <p className="text-sm text-muted-foreground">{event.description}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays size={14}/>
                <span>{formatEventDate(event.date)}</span>
              </div>
            </div>
            <DialogFooter>
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
