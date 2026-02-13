'use client';

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Card, CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose} from "@/components/ui/dialog";
import {Plus, Trash2, RefreshCw, Loader2, CalendarDays} from "lucide-react";

interface EventData {
  _id: string;
  name: string;
  date: string;
  image: string | null;
  description: string;
}

export default function EventsTab() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({name: "", date: "", image: "", description: ""});

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/commission/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.date || !form.description) return;
    setCreating(true);
    try {
      const res = await fetch("/api/commission/events", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(prev => [data.event, ...prev]);
        setForm({name: "", date: "", image: "", description: ""});
        setDialogOpen(false);
      }
    } catch { /* ignore */ }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/commission/events/${id}`, {method: "DELETE"});
      if (res.ok) {
        setEvents(prev => prev.filter(e => e._id !== id));
      }
    } catch { /* ignore */ }
    setDeletingId(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("ru-RU", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Мероприятия</h2>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16}/>
                Создать мероприятие
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новое мероприятие</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input
                    placeholder="Название мероприятия"
                    value={form.name}
                    onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Дата и время</Label>
                  <Input
                    type="datetime-local"
                    value={form.date}
                    onChange={e => setForm(f => ({...f, date: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea
                    placeholder="Описание мероприятия"
                    value={form.description}
                    onChange={e => setForm(f => ({...f, description: e.target.value}))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ссылка на изображение <span className="text-muted-foreground">(необязательно)</span></Label>
                  <Input
                    placeholder="https://..."
                    value={form.image}
                    onChange={e => setForm(f => ({...f, image: e.target.value}))}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Отмена</Button>
                </DialogClose>
                <Button
                  onClick={handleCreate}
                  disabled={creating || !form.name || !form.date || !form.description}
                >
                  {creating ? <Loader2 size={16} className="animate-spin"/> : "Создать"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="icon" onClick={fetchEvents} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>}
          </Button>
        </div>
      </div>

      <Card className="bg-background/70 overflow-hidden">
        <CardContent className="p-0">
          <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Название</TableHead>
              <TableHead>Дата и время</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead className="w-20">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 size={20} className="animate-spin mx-auto text-muted-foreground"/>
                </TableCell>
              </TableRow>
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <CalendarDays size={24}/>
                    <span>Нет мероприятий</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              events.map(event => (
                <TableRow key={event._id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatDate(event.date)}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {event.description}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(event._id)}
                      disabled={deletingId === event._id}
                    >
                      {deletingId === event._id
                        ? <Loader2 size={14} className="animate-spin"/>
                        : <Trash2 size={14}/>
                      }
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Всего: {events.length}
      </p>
    </div>
  );
}
