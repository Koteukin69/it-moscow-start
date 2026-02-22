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
import MultiImageUpload from "./multi-image-upload";
import DeleteButton from "./delete-button";

interface ProductData {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  stock: number | null;
  variants: Record<string, number> | null;
  variantLabel: string | null;
  isNew: boolean;
}

interface FormState {
  name: string;
  price: string;
  description: string;
  images: string[];
  isNew: boolean;
  variantLabel: string;
  variantFields: {label: string; value: string}[];
}

const emptyVariantField = () => ({label: "", value: ""});

const emptyForm = (): FormState => ({
  name: "", price: "", description: "", images: [], isNew: false,
  variantLabel: "Размер",
  variantFields: [emptyVariantField()],
});

const variantFieldsToBody = (fields: {label: string; value: string}[]): {stock?: number; variants?: Record<string, number>} => {
  if (fields.length === 1 && !fields[0].label.trim()) {
    const v = Number(fields[0].value);
    return v > 0 ? {stock: v} : {};
  }
  const variants: Record<string, number> = {};
  fields.forEach(f => {
    if (f.label.trim()) variants[f.label.trim()] = Number(f.value) || 0;
  });
  return Object.keys(variants).length > 0 ? {variants} : {};
};

const productToForm = (p: ProductData): FormState => {
  let variantFields: {label: string; value: string}[];
  if (p.variants && Object.keys(p.variants).length > 0) {
    variantFields = Object.entries(p.variants).map(([k, v]) => ({label: k, value: v.toString()}));
  } else if (p.stock !== null) {
    variantFields = [{label: "", value: p.stock.toString()}];
  } else {
    variantFields = [emptyVariantField()];
  }
  return {
    name: p.name,
    price: p.price.toString(),
    description: p.description,
    images: p.images,
    isNew: p.isNew,
    variantLabel: p.variantLabel || "Размер",
    variantFields,
  };
};

function VariantFieldsEditor({fields, onChange, variantLabel}: {
  fields: {label: string; value: string}[];
  onChange: (fields: {label: string; value: string}[]) => void;
  variantLabel: string;
}) {
  const hasLabels = fields.length > 1 || fields[0]?.label.trim();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Остаток</Label>
        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          onClick={() => onChange([...fields, emptyVariantField()])}
        >
          <Plus size={14}/>
        </Button>
      </div>
      {fields.map((field, i) => (
        <div key={i} className="flex items-center gap-2">
          {(hasLabels || fields.length > 1) && (
            <Input
              placeholder={variantLabel || "Вариант"}
              value={field.label}
              onChange={e => {
                const next = [...fields];
                next[i] = {...next[i], label: e.target.value};
                onChange(next);
              }}
              className="w-24"
            />
          )}
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={field.value}
            onChange={e => {
              const next = [...fields];
              next[i] = {...next[i], value: e.target.value};
              onChange(next);
            }}
          />
          {fields.length > 1 && (
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              onClick={() => onChange(fields.filter((_, j) => j !== i))}
            >
              <Minus size={14}/>
            </Button>
          )}
        </div>
      ))}
    </div>
  );
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

  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

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
        images: form.images,
        ...variantFieldsToBody(form.variantFields),
      };
      const hasVariants = form.variantFields.length > 1 || form.variantFields[0]?.label.trim();
      if (hasVariants) body.variantLabel = form.variantLabel;

      const res = await fetch("/api/commission/products", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(prev => [data.product, ...prev]);
        setForm(emptyForm());
        setDialogOpen(false);
      }
    } catch { /* ignore */ }
    setCreating(false);
  };

  const openEdit = (p: ProductData) => {
    setEditForm(productToForm(p));
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
        images: editForm.images,
        ...variantFieldsToBody(editForm.variantFields),
      };
      const hasVariants = editForm.variantFields.length > 1 || editForm.variantFields[0]?.label.trim();
      if (hasVariants) body.variantLabel = editForm.variantLabel;

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
      if (res.ok) setProducts(prev => prev.filter(p => p._id !== id));
    } catch { /* ignore */ }
    setDeletingId(null);
  };

  const openRestock = (product: ProductData) => {
    setRestockDialog(product);
    if (product.variants) {
      const vals: Record<string, string> = {};
      Object.entries(product.variants).forEach(([k, v]) => { vals[k] = v.toString(); });
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
      if (restockDialog.variants) {
        const variants: Record<string, number> = {};
        Object.keys(restockValues).forEach(k => { variants[k] = Number(restockValues[k]) || 0; });
        body.variants = variants;
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
    if (product.variants && Object.keys(product.variants).length > 0) {
      return (
        <div className="flex flex-wrap gap-1">
          {Object.entries(product.variants).map(([variant, count]) => (
            <Badge key={variant} variant="outline" className="text-xs">
              {variant}: {count}
            </Badge>
          ))}
        </div>
      );
    }
    if (product.stock !== null) return <span>Всего: {product.stock}</span>;
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
      header: "Остаток",
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

  const renderProductForm = (f: FormState, setF: (updater: (prev: FormState) => FormState) => void) => (
    <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
      <div className="space-y-2">
        <Label>Название</Label>
        <Input placeholder="Название товара" value={f.name} onChange={e => setF(prev => ({...prev, name: e.target.value}))}/>
      </div>
      <div className="space-y-2">
        <Label>Цена (монетки)</Label>
        <Input type="number" min="0" placeholder="100" value={f.price} onChange={e => setF(prev => ({...prev, price: e.target.value}))}/>
      </div>
      <div className="space-y-2">
        <Label>Описание</Label>
        <Textarea placeholder="Описание товара" value={f.description} onChange={e => setF(prev => ({...prev, description: e.target.value}))} rows={2}/>
      </div>
      <MultiImageUpload value={f.images} onChange={urls => setF(prev => ({...prev, images: urls}))}/>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={f.isNew} onChange={e => setF(prev => ({...prev, isNew: e.target.checked}))}/>
          Метка NEW
        </label>
      </div>
      <div className="space-y-2">
        <Label>Подпись варианта</Label>
        <Input placeholder="Размер, Цвет..." value={f.variantLabel} onChange={e => setF(prev => ({...prev, variantLabel: e.target.value}))}/>
      </div>
      <VariantFieldsEditor
        fields={f.variantFields}
        onChange={fields => setF(prev => ({...prev, variantFields: fields}))}
        variantLabel={f.variantLabel}
      />
    </div>
  );

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
              {renderProductForm(form, setForm)}
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
              {renderProductForm(editForm, setEditForm)}
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
                {restockDialog.variants ? (
                  Object.keys(restockDialog.variants).map(variant => (
                    <div key={variant} className="flex items-center gap-3">
                      <Label className="w-12">{variant}</Label>
                      <Input
                        type="number"
                        min="0"
                        value={restockValues[variant] ?? "0"}
                        onChange={e => setRestockValues(v => ({...v, [variant]: e.target.value}))}
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
