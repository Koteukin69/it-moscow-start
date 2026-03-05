'use client';

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose} from "@/components/ui/dialog";
import {Plus, RefreshCw, Loader2, HelpCircle, Pencil} from "lucide-react";
import DataTable, {type Column} from "./data-table";
import DeleteButton from "./delete-button";

interface FaqItem {
  _id: string;
  question: string;
  answer: string;
}

const MAX_ANSWER_PREVIEW = 150;

export default function FaqTab() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({question: "", answer: ""});
  const [editingItem, setEditingItem] = useState<FaqItem | null>(null);
  const [editForm, setEditForm] = useState({question: "", answer: ""});
  const [saving, setSaving] = useState(false);

  const fetchFaq = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/commission/faq");
      if (res.ok) {
        const data = await res.json();
        setItems(data.faq);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchFaq();
  }, []);

  const handleCreate = async () => {
    if (!form.question || !form.answer) return;
    setCreating(true);
    try {
      const res = await fetch("/api/commission/faq", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setItems(prev => [...prev, data.item]);
        setForm({question: "", answer: ""});
        setDialogOpen(false);
      }
    } catch { /* ignore */ }
    setCreating(false);
  };

  const openEdit = (item: FaqItem) => {
    setEditForm({question: item.question, answer: item.answer});
    setEditingItem(item);
  };

  const handleUpdate = async () => {
    if (!editingItem || !editForm.question || !editForm.answer) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/commission/faq/${editingItem._id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const data = await res.json();
        setItems(prev => prev.map(i => i._id === data.item._id ? data.item : i));
        setEditingItem(null);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/commission/faq/${id}`, {method: "DELETE"});
      if (res.ok) {
        setItems(prev => prev.filter(i => i._id !== id));
      }
    } catch { /* ignore */ }
    setDeletingId(null);
  };

  const columns: Column<FaqItem>[] = [
    {
      header: "Вопрос",
      cell: (i) => <span className="font-medium max-w-sm truncate block">{i.question}</span>,
    },
    {
      header: "Ответ",
      cell: (i) => (
        <span className="text-muted-foreground max-w-sm truncate block">
          {i.answer.length > MAX_ANSWER_PREVIEW
            ? i.answer.slice(0, MAX_ANSWER_PREVIEW) + "…"
            : i.answer}
        </span>
      ),
    },
    {
      header: "Действия",
      className: "w-24",
      cell: (i) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(i)} title="Редактировать">
            <Pencil size={14}/>
          </Button>
          <DeleteButton loading={deletingId === i._id} onClick={() => handleDelete(i._id)}/>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">FAQ</h2>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16}/>
                Добавить вопрос
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый вопрос</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Вопрос</Label>
                  <Input
                    placeholder="Текст вопроса"
                    value={form.question}
                    onChange={e => setForm(f => ({...f, question: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ответ</Label>
                  <Textarea
                    placeholder="Текст ответа"
                    value={form.answer}
                    onChange={e => setForm(f => ({...f, answer: e.target.value}))}
                    rows={6}
                    className="resize-y"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Отмена</Button>
                </DialogClose>
                <Button
                  onClick={handleCreate}
                  disabled={creating || !form.question || !form.answer}
                >
                  {creating ? <Loader2 size={16} className="animate-spin"/> : "Создать"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="icon" onClick={fetchFaq} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>}
          </Button>
        </div>
      </div>

      <DataTable
        data={items}
        columns={columns}
        keyField="_id"
        loading={loading}
        emptyIcon={<HelpCircle size={24}/>}
        emptyMessage="Нет вопросов"
      />

      <p className="text-sm text-muted-foreground">
        Всего: {items.length}
      </p>

      <Dialog open={!!editingItem} onOpenChange={(open) => { if (!open) setEditingItem(null); }}>
        <DialogContent>
          {editingItem && (
            <>
              <DialogHeader>
                <DialogTitle>Редактировать вопрос</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Вопрос</Label>
                  <Input
                    value={editForm.question}
                    onChange={e => setEditForm(f => ({...f, question: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ответ</Label>
                  <Textarea
                    value={editForm.answer}
                    onChange={e => setEditForm(f => ({...f, answer: e.target.value}))}
                    rows={6}
                    className="resize-y"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Отмена</Button>
                </DialogClose>
                <Button
                  onClick={handleUpdate}
                  disabled={saving || !editForm.question || !editForm.answer}
                >
                  {saving ? <Loader2 size={16} className="animate-spin"/> : "Сохранить"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
