'use client';

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose} from "@/components/ui/dialog";
import {Plus, RefreshCw, Loader2, CalendarDays} from "lucide-react";
import {formatDate} from "@/lib/utils";
import DataTable, {type Column} from "./data-table";
import ImageUpload from "./image-upload";
import DeleteButton from "./delete-button";

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

  const columns: Column<EventData>[] = [
    {
      header: "Название",
      cell: (e) => <span className="font-medium">{e.name}</span>,
    },
    {
      header: "Дата и время",
      cell: (e) => <span className="text-muted-foreground whitespace-nowrap">{formatDate(e.date)}</span>,
    },
    {
      header: "Описание",
      cell: (e) => <span className="text-muted-foreground max-w-xs truncate block">{e.description}</span>,
    },
    {
      header: "Действия",
      className: "w-20",
      cell: (e) => <DeleteButton loading={deletingId === e._id} onClick={() => handleDelete(e._id)}/>,
    },
  ];

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
                <ImageUpload value={form.image} onChange={url => setForm(f => ({...f, image: url}))}/>
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

      <DataTable
        data={events}
        columns={columns}
        keyField="_id"
        loading={loading}
        emptyIcon={<CalendarDays size={24}/>}
        emptyMessage="Нет мероприятий"
      />

      <p className="text-sm text-muted-foreground">
        Всего: {events.length}
      </p>
    </div>
  );
}
