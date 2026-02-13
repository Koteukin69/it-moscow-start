'use client';

import {useEffect, useState, useMemo} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Search, RefreshCw, Loader2, ClipboardList, Check, X} from "lucide-react";

interface OrderData {
  _id: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  size: string | null;
  price: number;
  code: string;
  createdAt: string;
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

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
      o.productName.toLowerCase().includes(q) ||
      o.code.includes(q)
    );
  }, [orders, search]);

  const handleAction = async (id: string, action: "deliver" | "cancel") => {
    setActionId(id);
    try {
      const res = await fetch(`/api/commission/orders/${id}?action=${action}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o._id !== id));
      }
    } catch { /* ignore */ }
    setActionId(null);
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
        <h2 className="text-xl font-semibold">Заказы</h2>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <Input
              placeholder="Поиск по имени, товару, коду..."
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

      <Card className="bg-background/70 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Код</TableHead>
                <TableHead>Абитуриент</TableHead>
                <TableHead>Товар</TableHead>
                <TableHead>Размер</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="w-28">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 size={20} className="animate-spin mx-auto text-muted-foreground"/>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ClipboardList size={24}/>
                      <span>{search ? "Ничего не найдено" : "Нет заказов"}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(order => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono font-semibold">{order.code}</TableCell>
                    <TableCell className="font-medium">{order.userName}</TableCell>
                    <TableCell>{order.productName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.size || <span className="text-muted-foreground/50">&mdash;</span>}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{order.price} <span className="text-muted-foreground text-xs">монет</span></TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled={actionId === order._id}
                          onClick={() => handleAction(order._id, "deliver")}
                        >
                          {actionId === order._id ? <Loader2 size={12} className="animate-spin"/> : <Check size={12}/>}
                          Выдать
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          disabled={actionId === order._id}
                          onClick={() => handleAction(order._id, "cancel")}
                          title="Отменить и вернуть монеты"
                        >
                          <X size={14}/>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Всего: {filtered.length} {search && `из ${orders.length}`}
      </p>
    </div>
  );
}
