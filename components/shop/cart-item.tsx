'use client';

import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Coins, Trash2} from "lucide-react";

export interface CartItemData {
  index: number;
  productId: string;
  quantity: number;
  variant?: string | null;
  name: string;
  price: number;
  images: string[];
  variants: Record<string, number> | null;
  variantLabel: string | null;
  stock: number | null;
}

interface CartItemGroupProps {
  items: CartItemData[];
  onUpdateVariant: (index: number, newVariant: string) => void;
  onRemoveAll: () => void;
}

export default function CartItemGroup({items, onUpdateVariant, onRemoveAll}: CartItemGroupProps) {
  const first = items[0];
  const hasVariants = first.variants && Object.keys(first.variants).length > 0;
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="flex gap-3 py-3">
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted/30 shrink-0">
        {first.images[0] ? (
          <img src={first.images[0]} alt={first.name} className="w-full h-full object-cover"/>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            <Coins size={20}/>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate">{first.name}</p>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 text-sm">
              <Coins size={12} className="text-yellow-500"/>
              <span className="font-medium">{totalPrice}</span>
              {totalQty > 1 && (
                <span className="text-muted-foreground text-xs">({first.price} x {totalQty})</span>
              )}
            </div>
            <Button variant="ghost" size="icon-xs" className="text-destructive hover:text-destructive" onClick={onRemoveAll}>
              <Trash2 size={12}/>
            </Button>
          </div>
        </div>

        {hasVariants && items.map((item, i) => (
          <Select key={item.index} value={item.variant || ""} onValueChange={v => onUpdateVariant(item.index, v)}>
            <SelectTrigger className="h-7 text-xs w-full">
              <SelectValue placeholder={`${first.variantLabel || "Вариант"} ${items.length > 1 ? i + 1 : ""}`}/>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(first.variants!).map(([v, count]) => (
                <SelectItem key={v} value={v} disabled={count <= 0}>
                  {v} {count <= 0 ? "(нет)" : `(${count})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
    </div>
  );
}
