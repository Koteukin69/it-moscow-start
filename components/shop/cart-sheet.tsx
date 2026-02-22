'use client';

import {useMemo} from "react";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {Coins, Loader2, ShoppingCart} from "lucide-react";
import CartItemGroup, {type CartItemData} from "./cart-item";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItemData[];
  coins: number;
  checking: boolean;
  onUpdateVariant: (index: number, newVariant: string) => void;
  onRemove: (index: number) => void;
  onRemoveProduct: (productId: string) => void;
  onCheckout: () => void;
}

export default function CartSheet({
  open, onOpenChange, items, coins, checking,
  onUpdateVariant, onRemove, onRemoveProduct, onCheckout,
}: CartSheetProps) {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deficit = total - coins;
  const canBuy = total > 0 && deficit <= 0;

  const groups = useMemo(() => {
    const map = new Map<string, CartItemData[]>();
    items.forEach(item => {
      const arr = map.get(item.productId);
      if (arr) arr.push(item);
      else map.set(item.productId, [item]);
    });
    return Array.from(map.values());
  }, [items]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Корзина</SheetTitle>
          <SheetDescription className="sr-only">Управление корзиной</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <ShoppingCart size={32}/>
              <span>Корзина пуста</span>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {groups.map(group => (
                <CartItemGroup
                  key={group[0].productId}
                  items={group}
                  onUpdateVariant={onUpdateVariant}
                  onRemoveAll={() => onRemoveProduct(group[0].productId)}
                />
              ))}
            </div>
          )}
        </div>

        {groups.length > 0 && (
          <SheetFooter className="border-t pt-4 space-y-3">
            <div className="flex justify-between items-center w-full">
              <span className="text-sm text-muted-foreground">Итого</span>
              <div className="flex items-center gap-1 font-semibold">
                <Coins size={14} className="text-yellow-500"/>
                {total}
              </div>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-sm text-muted-foreground">Баланс</span>
              <div className="flex items-center gap-1 text-sm">
                <Coins size={12} className="text-yellow-500"/>
                {coins}
              </div>
            </div>
            {deficit > 0 && (
              <p className="text-sm text-destructive w-full text-center">
                Не хватает {deficit} монет
              </p>
            )}
            <Button
              className="w-full"
              disabled={!canBuy || checking}
              onClick={onCheckout}
            >
              {checking ? <Loader2 size={16} className="animate-spin"/> : "Купить"}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
