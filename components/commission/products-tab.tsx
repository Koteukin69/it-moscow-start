'use client';

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose} from "@/components/ui/dialog";
import {Plus, Minus, RefreshCw, Loader2, ShoppingBag, Package, Pencil} from "lucide-react";
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

  const emptyStockField = () => ({label: "", value: ""});

  const [form, setForm] = useState({
    name: "", price: "", description: "", image: "", isNew: false,
    stockFields: [emptyStockField()],
  });

  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [editForm, setEditForm] = useState({
    name: "", price: "", description: "", image: "", isNew: false,
    stockFields: [emptyStockField()],
  });
  const [saving, setSaving] = useState(false);

  const stockFieldsToBody = (fields: {label: string; value: string}[]): {stock?: number; sizes?: Record<string, number>} => {
    if (fields.length === 1) {
      const v = Number(fields[0].value);
      return v > 0 ? {stock: v} : {};
    }
    const sizes: Record<string, number> = {};
    fields.forEach(f => {
      if (f.label.trim()) sizes[f.label.trim()] = Number(f.value) || 0;
    });
    return Object.keys(sizes).length > 0 ? {sizes} : {};
  };

  const productToStockFields = (p: ProductData): {label: string; value: string}[] => {
    if (p.sizes && Object.keys(p.sizes).length > 0) {
      return Object.entries(p.sizes).map(([k, v]) => ({label: k, value: v.toString()}));
    }
    if (p.stock !== null) {
      return [{label: "", value: p.stock.toString()}];
    }
    return [emptyStockField()];
  };

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
        ...stockFieldsToBody(form.stockFields),
      };
      if (form.image) body.image = form.image;
      const res = await fetch("/api/commission/products", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(prev => [data.product, ...prev]);
        setForm({name: "", price: "", description: "", image: "", isNew: false, stockFields: [emptyStockField()]});
        setDialogOpen(false);
      }
    } catch { /* ignore */ }
    setCreating(false);
  };

  const openEdit = (p: ProductData) => {
    setEditForm({
      name: p.name,
      price: p.price.toString(),
      description: p.description,
      image: p.image || "",
      isNew: p.isNew,
      stockFields: productToStockFields(p),
    });
    setEditingProduct(p);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct || !editForm.name || !editForm.price || !editForm.description) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: editForm.name,
        price: Number(editForm.price),
        description: editForm.description,
        isNew: editForm.isNew,
        ...stockFieldsToBody(editForm.stockFields),
      };
      if (editForm.image) body.image = editForm.image;
      const res = await fetch(`/api/commission/products/${editingProduct._id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(prev => prev.map(p => p._id === data.product._id ? data.product : p));
        setEditingProduct(null);
      }
    } catch { /* ignore */ }
    setSaving(false);
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
          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)} title="Редактировать">
            <Pencil size={14}/>
          </Button>
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
              <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
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
                  <div className="flex items-center justify-between">
                    <Label>Остаток</Label>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      type="button"
                      onClick={() => setForm(f => ({...f, stockFields: [...f.stockFields, emptyStockField()]}))}
                    >
                      <Plus size={14}/>
                    </Button>
                  </div>
                  {form.stockFields.map((field, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {form.stockFields.length > 1 && (
                        <Input
                          placeholder="Размер"
                          value={field.label}
                          onChange={e => setForm(f => {
                            const fields = [...f.stockFields];
                            fields[i] = {...fields[i], label: e.target.value};
                            return {...f, stockFields: fields};
                          })}
                          className="w-24"
                        />
                      )}
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={field.value}
                        onChange={e => setForm(f => {
                          const fields = [...f.stockFields];
                          fields[i] = {...fields[i], value: e.target.value};
                          return {...f, stockFields: fields};
                        })}
                      />
                      {form.stockFields.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          type="button"
                          onClick={() => setForm(f => ({...f, stockFields: f.stockFields.filter((_, j) => j !== i)}))}
                        >
                          <Minus size={14}/>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
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

      <Dialog open={!!editingProduct} onOpenChange={(open) => { if (!open) setEditingProduct(null); }}>
        <DialogContent>
          {editingProduct && (
            <>
              <DialogHeader>
                <DialogTitle>Редактировать товар</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input value={editForm.name} onChange={e => setEditForm(f => ({...f, name: e.target.value}))}/>
                </div>
                <div className="space-y-2">
                  <Label>Цена (монетки)</Label>
                  <Input type="number" min="0" value={editForm.price} onChange={e => setEditForm(f => ({...f, price: e.target.value}))}/>
                </div>
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea value={editForm.description} onChange={e => setEditForm(f => ({...f, description: e.target.value}))} rows={2}/>
                </div>
                <ImageUpload value={editForm.image} onChange={url => setEditForm(f => ({...f, image: url}))}/>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editForm.isNew} onChange={e => setEditForm(f => ({...f, isNew: e.target.checked}))}/>
                    Метка NEW
                  </label>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Остаток</Label>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      type="button"
                      onClick={() => setEditForm(f => ({...f, stockFields: [...f.stockFields, emptyStockField()]}))}
                    >
                      <Plus size={14}/>
                    </Button>
                  </div>
                  {editForm.stockFields.map((field, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {editForm.stockFields.length > 1 && (
                        <Input
                          placeholder="Размер"
                          value={field.label}
                          onChange={e => setEditForm(f => {
                            const fields = [...f.stockFields];
                            fields[i] = {...fields[i], label: e.target.value};
                            return {...f, stockFields: fields};
                          })}
                          className="w-24"
                        />
                      )}
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={field.value}
                        onChange={e => setEditForm(f => {
                          const fields = [...f.stockFields];
                          fields[i] = {...fields[i], value: e.target.value};
                          return {...f, stockFields: fields};
                        })}
                      />
                      {editForm.stockFields.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          type="button"
                          onClick={() => setEditForm(f => ({...f, stockFields: f.stockFields.filter((_, j) => j !== i)}))}
                        >
                          <Minus size={14}/>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Отмена</Button>
                </DialogClose>
                <Button onClick={handleSaveEdit} disabled={saving || !editForm.name || !editForm.price || !editForm.description}>
                  {saving ? <Loader2 size={16} className="animate-spin"/> : "Сохранить"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

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
