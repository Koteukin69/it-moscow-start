'use client';

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose} from "@/components/ui/dialog";
import {Plus, RefreshCw, Loader2, ShoppingBag, Package} from "lucide-react";
import DataTable, {type Column} from "./data-table";
import ImageUpload from "./image-upload";
import DeleteButton from "./delete-button";

interface ProductData {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string | null;
  stock: number | null;
  sizes: Record<string, number> | null;
  isNew: boolean;
}

export default function ProductsTab() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [restockDialog, setRestockDialog] = useState<ProductData | null>(null);
  const [restockValues, setRestockValues] = useState<Record<string, string>>({});
  const [restockLoading, setRestockLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", price: "", description: "", image: "", isNew: false,
    hasSizes: false, sizes: "" as string,
    hasStock: false, stock: "" as string,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/commission/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.price || !form.description) return;
    setCreating(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        isNew: form.isNew,
      };
      if (form.image) body.image = form.image;
      if (form.hasSizes && form.sizes) {
        const sizes: Record<string, number> = {};
        form.sizes.split(",").forEach(pair => {
          const [key, val] = pair.split(":").map(s => s.trim());
          if (key && val) sizes[key] = Number(val) || 0;
        });
        body.sizes = sizes;
      }
      if (form.hasStock && form.stock) {
        body.stock = Number(form.stock) || 0;
      }
      const res = await fetch("/api/commission/products", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(prev => [data.product, ...prev]);
        setForm({name: "", price: "", description: "", image: "", isNew: false, hasSizes: false, sizes: "", hasStock: false, stock: ""});
        setDialogOpen(false);
      }
    } catch { /* ignore */ }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/commission/products/${id}`, {method: "DELETE"});
      if (res.ok) {
        setProducts(prev => prev.filter(p => p._id !== id));
      }
    } catch { /* ignore */ }
    setDeletingId(null);
  };

  const openRestock = (product: ProductData) => {
    setRestockDialog(product);
    if (product.sizes) {
      const vals: Record<string, string> = {};
      Object.entries(product.sizes).forEach(([k, v]) => { vals[k] = v.toString(); });
      setRestockValues(vals);
    } else {
      setRestockValues({stock: (product.stock ?? 0).toString()});
    }
  };

  const handleRestock = async () => {
    if (!restockDialog) return;
    setRestockLoading(true);
    try {
      const body: Record<string, unknown> = {};
      if (restockDialog.sizes) {
        const sizes: Record<string, number> = {};
        Object.keys(restockValues).forEach(k => {
          sizes[k] = Number(restockValues[k]) || 0;
        });
        body.sizes = sizes;
      } else {
        body.stock = Number(restockValues.stock) || 0;
      }
      const res = await fetch(`/api/commission/products/${restockDialog._id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(prev => prev.map(p => p._id === data.product._id ? data.product : p));
        setRestockDialog(null);
      }
    } catch { /* ignore */ }
    setRestockLoading(false);
  };

  const formatStock = (product: ProductData) => {
    if (product.sizes && Object.keys(product.sizes).length > 0) {
      return (
        <div className="flex flex-wrap gap-1">
          {Object.entries(product.sizes).map(([size, count]) => (
            <Badge key={size} variant="outline" className="text-xs">
              {size}: {count}
            </Badge>
          ))}
        </div>
      );
    }
    if (product.stock !== null) {
      return <span>Всего: {product.stock}</span>;
    }
    return <span className="text-muted-foreground/50">&mdash;</span>;
  };

  const columns: Column<ProductData>[] = [
    {
      header: "Название",
      cell: (p) => (
        <div className="flex items-center gap-2 font-medium">
          {p.name}
          {p.isNew && <Badge className="text-xs">NEW</Badge>}
        </div>
      ),
    },
    {
      header: "Цена",
      cell: (p) => <span className="whitespace-nowrap">{p.price} <span className="text-muted-foreground text-xs">монет</span></span>,
    },
    {
      header: "Описание",
      cell: (p) => <span className="text-muted-foreground max-w-xs truncate block">{p.description}</span>,
    },
    {
      header: "Остаток / по размерам",
      cell: (p) => formatStock(p),
    },
    {
      header: "Действия",
      className: "w-24",
      cell: (p) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => openRestock(p)} title="Пополнить">
            <Package size={14}/>
          </Button>
          <DeleteButton loading={deletingId === p._id} onClick={() => handleDelete(p._id)}/>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Товары</h2>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16}/>
                Добавить товар
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый товар</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input placeholder="Название товара" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}/>
                </div>
                <div className="space-y-2">
                  <Label>Цена (монетки)</Label>
                  <Input type="number" min="0" placeholder="100" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))}/>
                </div>
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea placeholder="Описание товара" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2}/>
                </div>
                <ImageUpload value={form.image} onChange={url => setForm(f => ({...f, image: url}))}/>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.isNew} onChange={e => setForm(f => ({...f, isNew: e.target.checked}))}/>
                    Метка NEW
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.hasSizes} onChange={e => setForm(f => ({...f, hasSizes: e.target.checked, hasStock: false}))}/>
                    Размеры
                  </label>
                  {form.hasSizes && (
                    <Input placeholder="S:10, M:15, L:20" value={form.sizes} onChange={e => setForm(f => ({...f, sizes: e.target.value}))}/>
                  )}
                </div>
                {!form.hasSizes && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={form.hasStock} onChange={e => setForm(f => ({...f, hasStock: e.target.checked}))}/>
                      Общий остаток
                    </label>
                    {form.hasStock && (
                      <Input type="number" min="0" placeholder="50" value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))}/>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Отмена</Button>
                </DialogClose>
                <Button onClick={handleCreate} disabled={creating || !form.name || !form.price || !form.description}>
                  {creating ? <Loader2 size={16} className="animate-spin"/> : "Создать"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="icon" onClick={fetchProducts} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>}
          </Button>
        </div>
      </div>

      <DataTable
        data={products}
        columns={columns}
        keyField="_id"
        loading={loading}
        emptyIcon={<ShoppingBag size={24}/>}
        emptyMessage="Нет товаров"
      />

      <p className="text-sm text-muted-foreground">
        Всего: {products.length}
      </p>

      <Dialog open={!!restockDialog} onOpenChange={(open) => {if (!open) setRestockDialog(null);}}>
        <DialogContent>
          {restockDialog && (
            <>
              <DialogHeader>
                <DialogTitle>Пополнить: {restockDialog.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {restockDialog.sizes ? (
                  Object.keys(restockDialog.sizes).map(size => (
                    <div key={size} className="flex items-center gap-3">
                      <Label className="w-12">{size}</Label>
                      <Input
                        type="number"
                        min="0"
                        value={restockValues[size] ?? "0"}
                        onChange={e => setRestockValues(v => ({...v, [size]: e.target.value}))}
                      />
                    </div>
                  ))
                ) : (
                  <div className="space-y-2">
                    <Label>Общий остаток</Label>
                    <Input
                      type="number"
                      min="0"
                      value={restockValues.stock ?? "0"}
                      onChange={e => setRestockValues({stock: e.target.value})}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Отмена</Button>
                </DialogClose>
                <Button onClick={handleRestock} disabled={restockLoading}>
                  {restockLoading ? <Loader2 size={16} className="animate-spin"/> : "Сохранить"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
