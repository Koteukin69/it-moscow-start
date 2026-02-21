'use client';

import {format} from "date-fns";
import {ru} from "date-fns/locale/ru";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {CalendarDays} from "lucide-react";

interface EventData {
  _id: string;
  name: string;
  date: string;
  image: string | null;
  description: string;
}

interface EventListDialogProps {
  events: EventData[];
  date: Date | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventSelect: (event: EventData) => void;
}

export default function EventListDialog({events, date, open, onOpenChange, onEventSelect}: EventListDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays size={18}/>
            {date ? format(date, "d MMMM", {locale: ru}) : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
          {events.map(event => (
            <Card
              key={event._id}
              className="bg-background/50 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onEventSelect(event)}
            >
              <CardContent className="flex gap-3 items-center p-3">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-14 h-14 rounded-md object-cover shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-md bg-muted/30 flex items-center justify-center shrink-0">
                    <CalendarDays size={20} className="text-muted-foreground"/>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{event.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{event.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Закрыть</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
