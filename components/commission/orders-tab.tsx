'use client';

import {useEffect, useState, useMemo, useCallback} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose} from "@/components/ui/dialog";
import {Search, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Loader2, ClipboardList, Package, XCircle, RotateCcw, Trash2} from "lucide-react";
import {formatDate} from "@/lib/utils";
import DataTable, {type Column} from "./data-table";

interface OrderData {
  _id: string;
  orderNumber: number;
  pickupCode: string;
  userId: string;
  userName: string;
  phone: string | null;
  productId: string;
  productName: string;
  variant: string | null;
  quantity: number;
  price: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
}

type StatusFilter = "all" | "pending" | "completed" | "cancelled";
type SortField = "orderNumber" | "productName" | "createdAt";
type SortDir = "asc" | "desc";

const statusConfig: Record<string, {label: string; variant: "default" | "secondary" | "destructive" | "outline"}> = {
  pending: {label: "Ожидает", variant: "outline"},
  completed: {label: "Выдан", variant: "default"},
  cancelled: {label: "Отменён", variant: "destructive"},
};

const filterTabs: {value: StatusFilter; label: string}[] = [
  {value: "all", label: "Все"},
  {value: "pending", label: "Ожидают"},
  {value: "completed", label: "Выданы"},
  {value: "cancelled", label: "Отменены"},
];

export default function OrdersTab() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("orderNumber");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [actionId, setActionId] = useState<string | null>(null);

  const [pickupDialog, setPickupDialog] = useState<OrderData | null>(null);
  const [pickupInput, setPickupInput] = useState("");
  const [pickupError, setPickupError] = useState("");
  const [pickupLoading, setPickupLoading] = useState(false);

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

  useEffect(() => { fetchOrders(); }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") {
      list = list.filter(o => o.status === statusFilter);
    }
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(o =>
        o.userName.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        (o.phone && o.phone.includes(q)) ||
        String(o.orderNumber).includes(q)
      );
    }
    return list;
  }, [orders, search, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortField) {
        case "orderNumber":
          return dir * (a.orderNumber - b.orderNumber);
        case "productName":
          return dir * a.productName.localeCompare(b.productName, "ru");
        case "createdAt":
          return dir * a.createdAt.localeCompare(b.createdAt);
        default:
          return 0;
      }
    });
  }, [filtered, sortField, sortDir]);

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }, [sortField]);

  const SortIcon = ({field}: {field: SortField}) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-muted-foreground/50"/>;
    return sortDir === "asc"
      ? <ArrowUp size={14} className="text-primary"/>
      : <ArrowDown size={14} className="text-primary"/>;
  };

  const updateStatus = async (id: string, status: string, pickupCode?: string) => {
    setActionId(id);
    try {
      const payload: Record<string, string> = {status};
      if (pickupCode) payload.pickupCode = pickupCode;
      const res = await fetch(`/api/commission/orders/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders(prev => prev.map(o => o._id === data.order._id ? data.order : o));
        return true;
      } else {
        return data.error || "Ошибка";
      }
    } catch {
      return "Ошибка сети";
    } finally {
      setActionId(null);
    }
  };

  const handlePickup = async () => {
    if (!pickupDialog) return;
    setPickupLoading(true);
    setPickupError("");
    const result = await updateStatus(pickupDialog._id, "completed", pickupInput);
    if (result === true) {
      setPickupDialog(null);
      setPickupInput("");
    } else {
      setPickupError(typeof result === "string" ? result : "Ошибка");
    }
    setPickupLoading(false);
  };

  const handleDelete = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/commission/orders/${id}`, {method: "DELETE"});
      if (res.ok) {
        setOrders(prev => prev.filter(o => o._id !== id));
      }
    } catch { /* ignore */ }
    setActionId(null);
  };

  const columns: Column<OrderData>[] = [
    {
      header: (
        <button onClick={() => toggleSort("orderNumber")} className="flex items-center gap-1 font-medium">
          # <SortIcon field="orderNumber"/>
        </button>
      ),
      className: "w-16",
      cell: (o) => <span className="font-mono font-semibold">#{o.orderNumber}</span>,
    },
    {
      header: (
        <button onClick={() => toggleSort("productName")} className="flex items-center gap-1 font-medium">
          Товар <SortIcon field="productName"/>
        </button>
      ),
      cell: (o) => (
        <div>
          <span className="font-medium">{o.productName}</span>
          {o.variant && <span className="text-muted-foreground text-xs ml-1.5">({o.variant})</span>}
          {o.quantity > 1 && <span className="text-muted-foreground text-xs ml-1">×{o.quantity}</span>}
        </div>
      ),
    },
    {
      header: "Телефон",
      cell: (o) => <span className="text-muted-foreground">{o.phone || <span className="text-muted-foreground/50">&mdash;</span>}</span>,
    },
    {
      header: (
        <button onClick={() => toggleSort("createdAt")} className="flex items-center gap-1 font-medium">
          Дата <SortIcon field="createdAt"/>
        </button>
      ),
      cell: (o) => <span className="text-muted-foreground whitespace-nowrap">{formatDate(o.createdAt)}</span>,
    },
    {
      header: "Статус",
      cell: (o) => {
        const st = statusConfig[o.status];
        return <Badge variant={st.variant}>{st.label}</Badge>;
      },
    },
    {
      header: "Действия",
      className: "w-48",
      cell: (o) => {
        const busy = actionId === o._id;
        return (
          <div className="flex gap-1">
            {o.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={busy}
                  onClick={() => { setPickupDialog(o); setPickupInput(""); setPickupError(""); }}
                >
                  <Package size={12}/>
                  Выдать
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive gap-1"
                  disabled={busy}
                  onClick={() => updateStatus(o._id, "cancelled")}
                >
                  {busy ? <Loader2 size={12} className="animate-spin"/> : <XCircle size={12}/>}
                  Отмена
                </Button>
              </>
            )}
            {o.status === "cancelled" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={busy}
                  onClick={() => updateStatus(o._id, "pending")}
                >
                  {busy ? <Loader2 size={12} className="animate-spin"/> : <RotateCcw size={12}/>}
                  Вернуть
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive gap-1"
                  disabled={busy}
                  onClick={() => handleDelete(o._id)}
                >
                  {busy ? <Loader2 size={12} className="animate-spin"/> : <Trash2 size={12}/>}
                  Удалить
                </Button>
              </>
            )}
            {o.status === "completed" && (
              <span className="text-xs text-muted-foreground italic">Выдан</span>
            )}
          </div>
        );
      },
    },
  ];

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {all: orders.length, pending: 0, completed: 0, cancelled: 0};
    for (const o of orders) counts[o.status] = (counts[o.status] || 0) + 1;
    return counts;
  }, [orders]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Заказы</h2>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <Input
              placeholder="Поиск по имени, товару, телефону, №..."
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

      <div className="flex gap-1 flex-wrap">
        {filterTabs.map(tab => (
          <Button
            key={tab.value}
            variant={statusFilter === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
            <span className="ml-1 text-xs opacity-70">({statusCounts[tab.value] ?? 0})</span>
          </Button>
        ))}
      </div>

      <DataTable
        data={sorted}
        columns={columns}
        keyField="_id"
        loading={loading}
        emptyIcon={<ClipboardList size={24}/>}
        emptyMessage={search || statusFilter !== "all" ? "Ничего не найдено" : "Нет заказов"}
      />

      <p className="text-sm text-muted-foreground">
        Показано: {sorted.length} из {orders.length}
      </p>

      <Dialog open={!!pickupDialog} onOpenChange={open => { if (!open) setPickupDialog(null); }}>
        <DialogContent>
          {pickupDialog && (
            <>
              <DialogHeader>
                <DialogTitle>Выдача заказа #{pickupDialog.orderNumber}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Товар: <span className="text-foreground font-medium">{pickupDialog.productName}</span></p>
                  <p>Абитуриент: <span className="text-foreground font-medium">{pickupDialog.userName}</span></p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Введите код выдачи (6 цифр)</p>
                  <Input
                    value={pickupInput}
                    onChange={e => { setPickupInput(e.target.value.replace(/\D/g, "").slice(0, 6)); setPickupError(""); }}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-2xl font-mono tracking-[0.3em] h-14"
                    autoFocus
                    onKeyDown={e => e.key === "Enter" && pickupInput.length === 6 && handlePickup()}
                  />
                  {pickupError && <p className="text-sm text-destructive">{pickupError}</p>}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Отмена</Button>
                </DialogClose>
                <Button onClick={handlePickup} disabled={pickupInput.length !== 6 || pickupLoading}>
                  {pickupLoading ? <Loader2 size={16} className="animate-spin"/> : "Подтвердить"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
