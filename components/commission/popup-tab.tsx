'use client';

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Loader2, Save} from "lucide-react";
import ImageUpload from "./image-upload";

interface PopupSettings {
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

const DEFAULT_SETTINGS: PopupSettings = {
  image: "/popup.png",
  title: "Задай вопрос",
  subtitle: "специалисту приёмной комиссии",
  description: "Запишитесь на бесплатную консультацию\nи узнайте все о поступлении",
};

export default function PopupTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<PopupSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetch("/api/commission/popup")
      .then(r => r.json())
      .then(data => {
        if (data.title) setForm(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/commission/popup", {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-xl font-semibold">Настройки попапа</h2>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={16} className="animate-spin"/>
          Загрузка...
        </div>
      ) : (
        <div className="space-y-4">
          <ImageUpload
            value={form.image}
            onChange={url => setForm(f => ({...f, image: url}))}
          />

          <div className="space-y-2">
            <Label>Заголовок</Label>
            <Input
              placeholder="Задай вопрос"
              value={form.title}
              onChange={e => setForm(f => ({...f, title: e.target.value}))}
            />
          </div>

          <div className="space-y-2">
            <Label>Подзаголовок <span className="text-muted-foreground font-normal text-xs">(необязательно)</span></Label>
            <Input
              placeholder="специалисту приёмной комиссии"
              value={form.subtitle}
              onChange={e => setForm(f => ({...f, subtitle: e.target.value}))}
            />
          </div>

          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              placeholder="Запишитесь на бесплатную консультацию..."
              value={form.description}
              onChange={e => setForm(f => ({...f, description: e.target.value}))}
              rows={3}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !form.title || !form.description || !form.image}
            className="gap-2"
          >
            {saving
              ? <Loader2 size={16} className="animate-spin"/>
              : <Save size={16}/>
            }
            {saved ? "Сохранено!" : "Сохранить"}
          </Button>
        </div>
      )}
    </div>
  );
}
