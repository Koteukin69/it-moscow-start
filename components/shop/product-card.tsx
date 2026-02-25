'use client';

import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator"
import {Coins, Plus, Minus} from "lucide-react";
import ImageCarousel from "./image-carousel";

export interface ProductData {
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

interface ProductCardProps {
  product: ProductData;
  cartQuantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onClick: () => void;
}

export default function ProductCard({product, cartQuantity, onAdd, onIncrement, onDecrement, onClick}: ProductCardProps) {
  const totalStock = () => {
    if (product.variants && Object.keys(product.variants).length > 0) {
      return Object.values(product.variants).reduce((a, b) => a + b, 0);
    }
    return product.stock;
  };

  const stock = totalStock();
  const outOfStock = stock !== null && stock !== undefined && stock <= 0;

  return (
    <Card
      className={`bg-background/70 overflow-hidden transition-all hover:shadow-lg ${outOfStock ? "opacity-50 pointer-events-none" : "cursor-pointer hover:scale-[1.02]"}`}
    >
      <div className="relative flex flex-col items-end" onClick={onClick}>
        {product.isNew && <Badge variant={"default"} className="shrink-0 text-[10px] mr-5 h-5 -mb-5 bg-green-400">NEW</Badge>}
        <ImageCarousel images={product.images} alt={product.name} className="aspect-square"/>
        {outOfStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Нет в наличии</span>
          </div>
        )}
      </div>
      <CardContent className="p-3 space-y-5">
        <div onClick={onClick}>
          <div className="flex items-center gap-1">
            <h3 className="font-medium text-sm sm:text-base truncate">{product.name}</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">{product.description}</p>
        </div>
        <Separator/>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Coins size={14} className="text-yellow-500"/>
            <span className="font-semibold text-sm sm:text-base">{product.price}</span>
          </div>
          {!outOfStock && (
            cartQuantity > 0 ? (
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon-xs" onClick={e => { e.stopPropagation(); onDecrement(); }}>
                  <Minus size={12}/>
                </Button>
                <span className="w-5 text-center text-xs sm:text-sm font-medium">{cartQuantity}</span>
                <Button variant="outline" size="icon-xs" onClick={e => { e.stopPropagation(); onIncrement(); }}>
                  <Plus size={12}/>
                </Button>
              </div>
            ) : (
              <Button
                size="xs"
                variant="outline"
                className="gap-1"
                onClick={e => { e.stopPropagation(); onAdd(); }}
              >
                <Plus size={12}/>
                <span className="hidden sm:inline">В корзину</span>
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
