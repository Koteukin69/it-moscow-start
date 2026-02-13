'use client';

import {useEffect, useState, useCallback} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose} from "@/components/ui/dialog";
import {Coins, Loader2, ShoppingBag} from "lucide-react";
import OrbAnimation from "@/components/orb";

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

export default function Shop({initialCoins}: {initialCoins: number}) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState(initialCoins);
  const [selected, setSelected] = useState<ProductData | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error"; text: string} | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shop");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalStock = (p: ProductData) => {
    if (p.sizes && Object.keys(p.sizes).length > 0) {
      return Object.values(p.sizes).reduce((a, b) => a + b, 0);
    }
    return p.stock;
  };

  const handleBuy = async () => {
    if (!selected) return;
    setBuying(true);
    setMessage(null);
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({productId: selected._id, size: selectedSize}),
      });
      const data = await res.json();
      if (res.ok) {
        setCoins(data.coins);
        setMessage({type: "success", text: `Заказ оформлен! Код для получения: ${data.code}`});
        setSelected(null);
        setSelectedSize(null);
        fetchProducts();
      } else {
        setMessage({type: "error", text: data.error || "Ошибка"});
      }
    } catch {
      setMessage({type: "error", text: "Ошибка сети"});
    }
    setBuying(false);
  };

  const openProduct = (p: ProductData) => {
    setSelected(p);
    setSelectedSize(null);
    setMessage(null);
  };

  const canBuy = () => {
    if (!selected) return false;
    if (selected.price > coins) return false;
    if (selected.sizes && Object.keys(selected.sizes).length > 0) {
      if (!selectedSize) return false;
      if (selected.sizes[selectedSize] <= 0) return false;
    } else if (selected.stock !== null && selected.stock <= 0) {
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen">
      <div className="overflow-hidden fixed inset-0 -z-1 flex items-center justify-center">
        <div className="w-full h-full">
          <OrbAnimation scaleMode="max"/>
        </div>
      </div>

      <div className="mx-auto px-6 sm:px-20 pt-20 pb-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Магазин мерча</h1>
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur border border-border/40 rounded-full px-4 py-2">
            <Coins size={18} className="text-yellow-500"/>
            <span className="font-semibold">{coins}</span>
          </div>
        </div>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm backdrop-blur ${
            message.type === "success"
              ? "bg-background/90 text-foreground border border-primary/30"
              : "bg-background/90 text-destructive border border-destructive/30"
          }`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={24} className="animate-spin text-muted-foreground"/>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
            <ShoppingBag size={32}/>
            <span>Товаров пока нет</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(product => {
              const stock = totalStock(product);
              const outOfStock = stock !== null && stock !== undefined && stock <= 0;

              return (
                <Card
                  key={product._id}
                  className={`bg-background/90 backdrop-blur overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${outOfStock ? "opacity-60" : ""}`}
                  onClick={() => !outOfStock && openProduct(product)}
                >
                  <div className="relative aspect-square bg-muted/30 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag size={48} className="text-muted-foreground/30"/>
                    )}
                    {product.isNew && (
                      <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">NEW</Badge>
                    )}
                    {outOfStock && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <span className="text-sm font-medium text-foreground">Нет в наличии</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium truncate text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground truncate mt-1">{product.description}</p>
                    <div className="flex items-center gap-1 mt-3">
                      <Coins size={14} className="text-yellow-500"/>
                      <span className="font-semibold text-foreground">{product.price}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => {if (!open) setSelected(null);}}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {selected.image && (
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted/30">
                    <img src={selected.image} alt={selected.name} className="w-full h-full object-cover"/>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">{selected.description}</p>
                <div className="flex items-center gap-1">
                  <Coins size={16} className="text-yellow-500"/>
                  <span className="font-semibold text-lg">{selected.price}</span>
                </div>

                {selected.sizes && Object.keys(selected.sizes).length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Размер</span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selected.sizes).map(([size, count]) => (
                        <Button
                          key={size}
                          variant={selectedSize === size ? "default" : "outline"}
                          size="sm"
                          disabled={count <= 0}
                          onClick={() => setSelectedSize(size)}
                          className="min-w-12"
                        >
                          {size}
                          {count <= 0 && <span className="ml-1 text-xs opacity-60">—</span>}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {selected.price > coins && (
                  <p className="text-sm text-destructive">Недостаточно монеток</p>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Закрыть</Button>
                </DialogClose>
                <Button
                  onClick={handleBuy}
                  disabled={!canBuy() || buying}
                >
                  {buying ? <Loader2 size={16} className="animate-spin"/> : "Купить"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
