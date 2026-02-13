'use client';

import {useEffect, useState, useMemo} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Search, RefreshCw, Loader2, ClipboardList} from "lucide-react";
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

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/commission/orders/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({status}),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === id ? {...o, status: status as OrderData["status"]} : o));
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
      className: "w-36",
      cell: (o) => o.status === "pending" ? (
        <div className="flex gap-1">
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
        </div>
      ) : null,
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
    </div>
  );
}
