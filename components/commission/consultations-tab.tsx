'use client';

import {useEffect, useState, useCallback} from "react";
import {Button} from "@/components/ui/button";
import {RefreshCw, Loader2, PhoneCall, ThumbsUp, ThumbsDown, MessageSquareOff} from "lucide-react";
import {formatDate} from "@/lib/utils";
import DataTable, {type Column} from "./data-table";
import type {ConsultationItem} from "@/lib/types";

function FlameIndicator({count}: {count: number}) {
  return (
    <div className="flex gap-0.5">
      {Array.from({length: 3}).map((_, i) => (
        <span key={i} className={i < count ? "opacity-100" : "opacity-20"}>
          🔥
        </span>
      ))}
    </div>
  );
}

export default function ConsultationsTab() {
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/commission/consultations");
      if (res.ok) {
        const data = await res.json();
        setConsultations(data.consultations);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const handleAction = async (id: string, action: "like" | "dislike") => {
    setActionId(id);
    try {
      const res = await fetch(`/api/commission/consultations/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({action}),
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data.removed) {
        setConsultations(prev => prev.filter(c => c._id !== id));
      } else if (data.consultation) {
        setConsultations(prev =>
          prev.map(c => c._id === id ? data.consultation : c)
        );
      }
    } catch { /* ignore */ }
    setActionId(null);
  };

  const columns: Column<ConsultationItem>[] = [
    {
      header: "ФИО",
      cell: (c) => <span className="font-medium">{c.name}</span>,
    },
    {
      header: "Телефон",
      cell: (c) => (
        <a
          href={`tel:${c.phone}`}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <PhoneCall size={14}/>
          {c.phone}
        </a>
      ),
    },
    {
      header: "Ребёнок",
      cell: (c) => <span>{c.childName}</span>,
    },
    {
      header: "Специальность",
      cell: (c) => <span className="text-muted-foreground">{c.specialty}</span>,
    },
    {
      header: "Класс",
      className: "w-20",
      cell: (c) => <span className="text-muted-foreground">{c.grade}</span>,
    },
    {
      header: "Попытки",
      className: "w-28",
      cell: (c) => <FlameIndicator count={c.flames}/>,
    },
    {
      header: "Дата",
      className: "w-36",
      cell: (c) => (
        <span className="text-muted-foreground whitespace-nowrap">
          {formatDate(c.createdAt)}
        </span>
      ),
    },
    {
      header: "Действия",
      className: "w-36",
      cell: (c) => {
        const busy = actionId === c._id;
        return (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 gap-1"
              disabled={busy}
              onClick={() => handleAction(c._id, "like")}
              title="Успешно — убрать из списка"
            >
              {busy ? (
                <Loader2 size={14} className="animate-spin"/>
              ) : (
                <ThumbsUp size={14}/>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive gap-1"
              disabled={busy}
              onClick={() => handleAction(c._id, "dislike")}
              title="Не дозвонились — убрать огонёк"
            >
              {busy ? (
                <Loader2 size={14} className="animate-spin"/>
              ) : (
                <ThumbsDown size={14}/>
              )}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Заявки на консультацию</h2>
        <Button variant="outline" size="icon" onClick={fetchConsultations} disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>}
        </Button>
      </div>

      <DataTable
        data={consultations}
        columns={columns}
        keyField="_id"
        loading={loading}
        emptyIcon={<MessageSquareOff size={24}/>}
        emptyMessage="Нет активных заявок"
      />

      <p className="text-sm text-muted-foreground">
        Активных заявок: {consultations.length}
      </p>
    </div>
  );
}
