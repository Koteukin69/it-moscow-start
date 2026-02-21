'use client';

import {useEffect, useState, useMemo} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Label} from "@/components/ui/label";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Search, RefreshCw, Loader2, ClipboardList, Pencil} from "lucide-react";
import {formatDate} from "@/lib/utils";
import DataTable, {type Column} from "./data-table";

interface OrderData {
  _id: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  size: string | null;
  price: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
}

const statusLabels: Record<string, {label: string; variant: "default" | "secondary" | "destructive" | "outline"}> = {
  pending: {label: "Ожидает", variant: "outline"},
  completed: {label: "Выдан", variant: "default"},
  cancelled: {label: "Отменён", variant: "destructive"},
};

export default function OrdersTab() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [editingOrder, setEditingOrder] = useState<OrderData | null>(null);
  const [editForm, setEditForm] = useState({status: "" as string, size: ""});
  const [saving, setSaving] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/commission/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter(o =>
      o.userName.toLowerCase().includes(q) ||
      o.productName.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const openEdit = (o: OrderData) => {
    setEditForm({status: o.status, size: o.size || ""});
    setEditingOrder(o);
  };

  const handleSaveEdit = async () => {
    if (!editingOrder) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/commission/orders/${editingOrder._id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({status: editForm.status, size: editForm.size || null}),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrders(prev => prev.map(o => o._id === data.order._id ? data.order : o));
        }
        setEditingOrder(null);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/commission/orders/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({status}),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrders(prev => prev.map(o => o._id === data.order._id ? data.order : o));
        } else {
          setOrders(prev => prev.map(o => o._id === id ? {...o, status: status as OrderData["status"]} : o));
        }
      }
    } catch { /* ignore */ }
    setUpdatingId(null);
  };

  const columns: Column<OrderData>[] = [
    {
      header: "Абитуриент",
      cell: (o) => <span className="font-medium">{o.userName}</span>,
    },
    {
      header: "Товар",
      cell: (o) => o.productName,
    },
    {
      header: "Размер",
      cell: (o) => <span className="text-muted-foreground">{o.size || <span className="text-muted-foreground/50">&mdash;</span>}</span>,
    },
    {
      header: "Цена",
      cell: (o) => <span className="whitespace-nowrap">{o.price} <span className="text-muted-foreground text-xs">монет</span></span>,
    },
    {
      header: "Дата",
      cell: (o) => <span className="text-muted-foreground whitespace-nowrap">{formatDate(o.createdAt)}</span>,
    },
    {
      header: "Статус",
      cell: (o) => {
        const st = statusLabels[o.status];
        return <Badge variant={st.variant}>{st.label}</Badge>;
      },
    },
    {
      header: "Действия",
      className: "w-44",
      cell: (o) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(o)} title="Редактировать">
            <Pencil size={14}/>
          </Button>
          {o.status === "pending" && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={updatingId === o._id}
                onClick={() => updateStatus(o._id, "completed")}
              >
                {updatingId === o._id ? <Loader2 size={12} className="animate-spin"/> : "Выдать"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                disabled={updatingId === o._id}
                onClick={() => updateStatus(o._id, "cancelled")}
              >
                Отмена
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Заказы</h2>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <Input
              placeholder="Поиск по имени, товару..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchOrders} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>}
          </Button>
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyField="_id"
        loading={loading}
        emptyIcon={<ClipboardList size={24}/>}
        emptyMessage={search ? "Ничего не найдено" : "Нет заказов"}
      />

      <p className="text-sm text-muted-foreground">
        Всего: {filtered.length} {search && `из ${orders.length}`}
      </p>

      <Dialog open={!!editingOrder} onOpenChange={(open) => { if (!open) setEditingOrder(null); }}>
        <DialogContent>
          {editingOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Редактировать заказ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Абитуриент: <span className="text-foreground font-medium">{editingOrder.userName}</span></p>
                  <p>Товар: <span className="text-foreground font-medium">{editingOrder.productName}</span></p>
                </div>
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select value={editForm.status} onValueChange={v => setEditForm(f => ({...f, status: v}))}>
                    <SelectTrigger>
                      <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Ожидает</SelectItem>
                      <SelectItem value="completed">Выдан</SelectItem>
                      <SelectItem value="cancelled">Отменён</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Размер</Label>
                  <Input value={editForm.size} onChange={e => setEditForm(f => ({...f, size: e.target.value}))} placeholder="Не указан"/>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Отмена</Button>
                </DialogClose>
                <Button onClick={handleSaveEdit} disabled={saving}>
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
