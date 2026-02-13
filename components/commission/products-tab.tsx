'use client';

import {useEffect, useState, useRef} from "react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Card, CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose} from "@/components/ui/dialog";
import {Plus, Trash2, RefreshCw, Loader2, ShoppingBag, Pencil, Upload, X} from "lucide-react";

interface SizeEntry {
  name: string;
  count: string;
}

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

function isDraft(p: ProductData) {
  return !p.name || !p.price || !p.description || !p.image;
}

function productToForm(p: ProductData) {
  const entries: SizeEntry[] = [];
  if (p.sizes && Object.keys(p.sizes).length > 0) {
    Object.entries(p.sizes).forEach(([name, count]) => {
      entries.push({name, count: count.toString()});
    });
  } else {
    entries.push({name: "", count: (p.stock ?? 0).toString()});
  }
  return {
    name: p.name,
    price: p.price.toString(),
    description: p.description,
    image: p.image || "",
    isNew: p.isNew,
    sizeEntries: entries,
  };
}

type FormState = ReturnType<typeof productToForm>;

function emptyForm(): FormState {
  return {name: "", price: "", description: "", image: "", isNew: false, sizeEntries: [{name: "", count: "0"}]};
}

export default function ProductsTab() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/commission/upload", {method: "POST", body: fd});
      if (res.ok) {
        const data = await res.json();
        setForm(f => ({...f, image: data.url}));
      }
    } catch { /* ignore */ }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const buildBody = () => {
    const body: Record<string, unknown> = {
      name: form.name,
      price: Number(form.price),
      description: form.description,
      isNew: form.isNew,
    };
    if (form.image) body.image = form.image;
    else body.image = null;

    const namedEntries = form.sizeEntries.filter(e => e.name.trim());
    if (namedEntries.length > 0) {
      const sizes: Record<string, number> = {};
      namedEntries.forEach(e => { sizes[e.name.trim()] = Number(e.count) || 0; });
      body.sizes = sizes;
      body.stock = null;
    } else if (form.sizeEntries.length > 0) {
      body.stock = Number(form.sizeEntries[0].count) || 0;
      body.sizes = null;
    }
    return body;
  };

  const handleCreate = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/commission/products", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(buildBody()),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(prev => [data.product, ...prev]);
        setForm(emptyForm());
        setDialogOpen(false);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editingProduct || !form.name) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/commission/products/${editingProduct._id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(buildBody()),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(prev => prev.map(p => p._id === data.product._id ? data.product : p));
        setEditingProduct(null);
        setDialogOpen(false);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/commission/products/${id}`, {method: "DELETE"});
      if (res.ok) setProducts(prev => prev.filter(p => p._id !== id));
    } catch { /* ignore */ }
    setDeletingId(null);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (product: ProductData) => {
    setEditingProduct(product);
    setForm(productToForm(product));
    setDialogOpen(true);
  };

  const addSizeEntry = () => {
    setForm(f => ({...f, sizeEntries: [...f.sizeEntries, {name: "", count: "0"}]}));
  };

  const removeSizeEntry = (idx: number) => {
    setForm(f => ({...f, sizeEntries: f.sizeEntries.filter((_, i) => i !== idx)}));
  };

  const updateSizeEntry = (idx: number, field: "name" | "count", value: string) => {
    setForm(f => ({
      ...f,
      sizeEntries: f.sizeEntries.map((e, i) => i === idx ? {...e, [field]: value} : e),
    }));
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Товары</h2>
        <div className="flex gap-2">
          <Button className="gap-2" onClick={openCreate}>
            <Plus size={16}/>
            Добавить товар
          </Button>
          <Button variant="outline" size="icon" onClick={fetchProducts} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>}
          </Button>
        </div>
      </div>

      <Card className="bg-background/70 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Название</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Остаток</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-24">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 size={20} className="animate-spin mx-auto text-muted-foreground"/>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ShoppingBag size={24}/>
                      <span>Нет товаров</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map(product => (
                  <TableRow key={product._id} className={isDraft(product) ? "opacity-60" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {product.image && (
                          <img src={product.image} alt="" className="w-8 h-8 rounded object-cover"/>
                        )}
                        {product.name}
                        {product.isNew && <Badge className="text-xs">NEW</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{product.price} <span className="text-muted-foreground text-xs">монет</span></TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">{product.description}</TableCell>
                    <TableCell>{formatStock(product)}</TableCell>
                    <TableCell>
                      {isDraft(product)
                        ? <Badge variant="outline" className="text-xs">Черновик</Badge>
                        : <Badge variant="secondary" className="text-xs">Опубликован</Badge>
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(product)} title="Редактировать">
                          <Pencil size={14}/>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(product._id)}
                          disabled={deletingId === product._id}
                        >
                          {deletingId === product._id ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
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
        Всего: {products.length}
      </p>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setEditingProduct(null);
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Редактировать товар" : "Новый товар"}</DialogTitle>
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
            <div className="space-y-2">
              <Label>Изображение (1:1)</Label>
              {form.image ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-muted/30 border border-border">
                  <img src={form.image} alt="" className="w-full h-full object-cover"/>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1 right-1 bg-background/80 hover:bg-background"
                    onClick={() => setForm(f => ({...f, image: ""}))}
                  >
                    <X size={12}/>
                  </Button>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 size={14} className="animate-spin"/> : <Upload size={14}/>}
                    Загрузить
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isNew} onChange={e => setForm(f => ({...f, isNew: e.target.checked}))}/>
                Метка NEW
              </label>
            </div>
            <div className="space-y-3">
              <Label>Остаток</Label>
              {form.sizeEntries.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {(form.sizeEntries.length > 1 || entry.name) ? (
                    <Input
                      placeholder="Название (напр. M, L)"
                      value={entry.name}
                      onChange={e => updateSizeEntry(idx, "name", e.target.value)}
                      className="flex-1"
                    />
                  ) : (
                    <span className="flex-1 text-sm text-muted-foreground px-3">Общий остаток</span>
                  )}
                  <Input
                    type="number"
                    min="0"
                    value={entry.count}
                    onChange={e => updateSizeEntry(idx, "count", e.target.value)}
                    className="w-24"
                  />
                  {form.sizeEntries.length > 1 && (
                    <Button variant="ghost" size="icon-sm" onClick={() => removeSizeEntry(idx)}>
                      <X size={14}/>
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1" onClick={addSizeEntry}>
                <Plus size={14}/> Добавить размер
              </Button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button onClick={editingProduct ? handleUpdate : handleCreate} disabled={saving || !form.name}>
              {saving ? <Loader2 size={16} className="animate-spin"/> : (editingProduct ? "Сохранить" : "Создать")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
