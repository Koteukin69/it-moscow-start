'use client';

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose} from "@/components/ui/dialog";
import {RefreshCw, Loader2, BookOpen, Pencil, Plus, Minus} from "lucide-react";
import DataTable, {type Column} from "./data-table";
import ImageUpload from "./image-upload";
import type {SpecialtyData, BudgetPlaceEntry} from "@/lib/types";

const ORB_OPTIONS: {value: SpecialtyData["orb"]; label: string}[] = [
  {value: "cyan", label: "Cyan"},
  {value: "aurora", label: "Aurora"},
  {value: "sunset", label: "Sunset"},
  {value: "neon", label: "Neon"},
];

type BudgetPlaceField = {label: string; count: string};

type EditForm = {
  code: string;
  title: string;
  description: string;
  relevance: string;
  curriculum: string;
  targetAudience: string;
  careers: string;
  image: string;
  icons: string;
  orb: SpecialtyData["orb"];
  budgetPlaces: BudgetPlaceField[];
};

function specialtyToForm(s: SpecialtyData): EditForm {
  return {
    code: s.code,
    title: s.title,
    description: s.description,
    relevance: s.relevance,
    curriculum: s.curriculum.join("\n"),
    targetAudience: s.targetAudience.join("\n"),
    careers: s.careers.join("\n"),
    image: s.image,
    icons: s.icons.join(", "),
    orb: s.orb,
    budgetPlaces: s.budgetPlaces !== null
      ? s.budgetPlaces.map(e => ({label: e.label, count: String(e.count)}))
      : [],
  };
}

function formToPayload(id: string, f: EditForm) {
  const budgetPlaces: BudgetPlaceEntry[] = f.budgetPlaces
    .filter(e => e.count.trim() !== "")
    .map(e => ({label: e.label.trim(), count: Number(e.count) || 0}));
  return {
    id,
    code: f.code,
    title: f.title,
    description: f.description,
    relevance: f.relevance,
    curriculum: f.curriculum.split("\n").map(l => l.trim()).filter(Boolean),
    targetAudience: f.targetAudience.split("\n").map(l => l.trim()).filter(Boolean),
    careers: f.careers.split("\n").map(l => l.trim()).filter(Boolean),
    image: f.image,
    icons: f.icons.split(",").map(l => l.trim()).filter(Boolean),
    orb: f.orb,
    budgetPlaces: budgetPlaces.length > 0 ? budgetPlaces : null,
  };
}

const EMPTY_FORM: EditForm = {
  code: "", title: "", description: "", relevance: "",
  curriculum: "", targetAudience: "", careers: "",
  image: "", icons: "", orb: "cyan", budgetPlaces: [],
};

function BudgetPlacesEditor({fields, onChange}: {
  fields: BudgetPlaceField[];
  onChange: (fields: BudgetPlaceField[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Бюджетных мест</Label>
        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          onClick={() => onChange([...fields, {label: "", count: ""}])}
        >
          <Plus size={14}/>
        </Button>
      </div>
      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground">Не указано</p>
      )}
      {fields.map((field, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder="Тип (напр. 11 класс)"
            value={field.label}
            onChange={e => {
              const next = [...fields];
              next[i] = {...next[i], label: e.target.value};
              onChange(next);
            }}
          />
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={field.count}
            onChange={e => {
              const next = [...fields];
              next[i] = {...next[i], count: e.target.value};
              onChange(next);
            }}
            className="w-24 shrink-0"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            onClick={() => onChange(fields.filter((_, j) => j !== i))}
          >
            <Minus size={14}/>
          </Button>
        </div>
      ))}
    </div>
  );
}

export default function SpecialtiesTab() {
  const [specialties, setSpecialties] = useState<SpecialtyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSpecialty, setEditingSpecialty] = useState<SpecialtyData | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/commission/specialties");
      if (res.ok) {
        const data = await res.json();
        setSpecialties(data.specialties);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const openEdit = (s: SpecialtyData) => {
    setEditForm(specialtyToForm(s));
    setEditingSpecialty(s);
  };

  const handleUpdate = async () => {
    if (!editingSpecialty || !editForm.code || !editForm.title || !editForm.description || !editForm.relevance || !editForm.image) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/commission/specialties/${editingSpecialty.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formToPayload(editingSpecialty.id, editForm)),
      });
      if (res.ok) {
        const data = await res.json();
        setSpecialties(prev => prev.map(s => s.id === data.specialty.id ? data.specialty : s));
        setEditingSpecialty(null);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const set = (key: keyof EditForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setEditForm(f => ({...f, [key]: e.target.value}));

  const columns: Column<SpecialtyData>[] = [
    {
      header: "Код",
      cell: (s) => <span className="font-mono text-sm">{s.code}</span>,
    },
    {
      header: "Название",
      cell: (s) => <span className="font-medium">{s.title}</span>,
    },
    {
      header: "Бюдж. мест",
      cell: (s) => (
        <span className="text-muted-foreground">
          {s.budgetPlaces && s.budgetPlaces.length > 0
            ? s.budgetPlaces.map(e => e.label ? `${e.label}: ${e.count}` : String(e.count)).join(", ")
            : "—"}
        </span>
      ),
    },
    {
      header: "Действия",
      className: "w-16",
      cell: (s) => (
        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(s)} title="Редактировать">
          <Pencil size={14}/>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Специальности</h2>
        <Button variant="outline" size="icon" onClick={fetchSpecialties} disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>}
        </Button>
      </div>

      <DataTable
        data={specialties}
        columns={columns}
        keyField="id"
        loading={loading}
        emptyIcon={<BookOpen size={24}/>}
        emptyMessage="Нет специальностей"
      />

      <Dialog open={!!editingSpecialty} onOpenChange={(open) => { if (!open) setEditingSpecialty(null); }}>
        <DialogContent className="max-w-2xl">
          {editingSpecialty && (
            <>
              <DialogHeader>
                <DialogTitle>Редактировать специальность</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Название</Label>
                    <Input value={editForm.title} onChange={set("title")}/>
                  </div>
                  <div className="space-y-2">
                    <Label>Код специальности</Label>
                    <Input value={editForm.code} onChange={set("code")} className="font-mono"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Цвет орба</Label>
                  <Select value={editForm.orb} onValueChange={(v) => setEditForm(f => ({...f, orb: v as SpecialtyData["orb"]}))}>
                    <SelectTrigger>
                      <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                      {ORB_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <BudgetPlacesEditor
                  fields={editForm.budgetPlaces}
                  onChange={fields => setEditForm(f => ({...f, budgetPlaces: fields}))}
                />
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea value={editForm.description} onChange={set("description")} rows={2}/>
                </div>
                <div className="space-y-2">
                  <Label>Актуальность</Label>
                  <Textarea value={editForm.relevance} onChange={set("relevance")} rows={2}/>
                </div>
                <div className="space-y-2">
                  <Label>Программа (каждый пункт с новой строки)</Label>
                  <Textarea value={editForm.curriculum} onChange={set("curriculum")} rows={4}/>
                </div>
                <div className="space-y-2">
                  <Label>Для кого (каждый пункт с новой строки)</Label>
                  <Textarea value={editForm.targetAudience} onChange={set("targetAudience")} rows={3}/>
                </div>
                <div className="space-y-2">
                  <Label>Кем станешь (каждый пункт с новой строки)</Label>
                  <Textarea value={editForm.careers} onChange={set("careers")} rows={3}/>
                </div>
                <div className="space-y-2">
                  <Label><p>Иконки <a href={"https://lucide.dev/icons/"} className={"hover:underline"} target="_blank">Lucide</a> (через запятую, например: Code, Globe, Terminal)</p></Label>
                  <Input value={editForm.icons} onChange={set("icons")} placeholder="Code, Globe, Monitor"/>
                </div>
                <ImageUpload value={editForm.image} onChange={url => setEditForm(f => ({...f, image: url}))}/>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Отмена</Button>
                </DialogClose>
                <Button
                  onClick={handleUpdate}
                  disabled={saving || !editForm.code || !editForm.title || !editForm.description || !editForm.relevance || !editForm.image}
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
