'use client';

import {useEffect, useState, useCallback, useMemo, useRef} from "react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {ArrowLeft, ArrowDownAZ, ArrowUpZA, ArrowDown01, ArrowUp10, Coins, Loader2, Minus, Plus, Search, ShoppingBag, ShoppingCart} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import OrbAnimation from "@/components/orb";
import ProductCard, {type ProductData} from "@/components/shop/product-card";
import CartSheet from "@/components/shop/cart-sheet";
import type {CartItemData} from "@/components/shop/cart-item";
import ImageCarousel from "@/components/shop/image-carousel";
import type {CartWithProducts} from "@/lib/types";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

interface ShopProps {
  initialCoins: number;
  initialCart: CartWithProducts;
}

function reindex(items: CartItemData[]): CartItemData[] {
  return items.map((item, i) => ({...item, index: i}));
}

const collator = new Intl.Collator(["ru", "en"], {sensitivity: "base", numeric: true});

export default function Shop({initialCoins, initialCart}: ShopProps) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState(initialCoins);
  const [cartItems, setCartItems] = useState<CartItemData[]>(
    reindex(initialCart.items.map(i => ({...i, index: 0, variant: i.variant || null})))
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [selected, setSelected] = useState<ProductData | null>(null);
  const [message, setMessage] = useState<{type: "success" | "error"; text: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const pendingRef = useRef(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shop");
      if (res.ok) setProducts((await res.json()).products);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => collator.compare(a.name, b.name));
        break;
      case "name-desc":
        result.sort((a, b) => collator.compare(b.name, a.name));
        break;
    }

    return result;
  }, [products, searchQuery, sortBy]);

  const applyServerCart = (data: {items: CartItemData[]}) => {
    setCartItems(reindex(data.items.map(i => ({...i, variant: i.variant || null}))));
  };

  const refetchCart = () => {
    fetch("/api/cart").then(r => r.ok ? r.json() : null).then(data => {
      if (data) applyServerCart(data);
    }).catch(() => {});
  };

  const cartAction = (
    optimistic: () => void,
    apiCall: () => Promise<Response>,
  ) => {
    optimistic();
    pendingRef.current++;
    apiCall()
      .then(async res => {
        const data = res.ok ? await res.json() : null;
        pendingRef.current--;
        if (pendingRef.current === 0) {
          if (data) applyServerCart(data);
          else refetchCart();
        }
      })
      .catch(() => {
        pendingRef.current--;
        if (pendingRef.current === 0) refetchCart();
      });
  };

  const cartCountMap = useMemo(() => {
    const map = new Map<string, number>();
    cartItems.forEach(i => map.set(i.productId, (map.get(i.productId) || 0) + i.quantity));
    return map;
  }, [cartItems]);

  const totalCartItems = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [cartItems],
  );

  const makeItem = (product: ProductData, variant?: string | null): CartItemData => ({
    index: 0,
    productId: product._id,
    quantity: 1,
    variant: variant || null,
    name: product.name,
    price: product.price,
    images: product.images,
    variants: product.variants,
    variantLabel: product.variantLabel,
    stock: product.stock,
  });

  const addToCart = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;
    const hasVariants = product.variants && Object.keys(product.variants).length > 0;

    cartAction(
      () => {
        if (hasVariants) {
          const first = Object.entries(product.variants!).find(([, c]) => c > 0)?.[0];
          setCartItems(prev => reindex([...prev, makeItem(product, first)]));
        } else {
          setCartItems(prev => {
            const idx = prev.findIndex(i => i.productId === productId);
            if (idx >= 0) return prev.map((it, i) => i === idx ? {...it, quantity: it.quantity + 1} : it);
            return reindex([...prev, makeItem(product)]);
          });
        }
      },
      () => fetch("/api/cart", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({productId}),
      }),
    );
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    cartAction(
      () => {
        if (quantity <= 0) setCartItems(prev => reindex(prev.filter(i => i.index !== index)));
        else setCartItems(prev => prev.map(i => i.index === index ? {...i, quantity} : i));
      },
      () => fetch("/api/cart", {
        method: quantity <= 0 ? "DELETE" : "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({index, quantity}),
      }),
    );
  };

  const updateCartVariant = (index: number, newVariant: string) => {
    cartAction(
      () => setCartItems(prev => prev.map(i => i.index === index ? {...i, variant: newVariant} : i)),
      () => fetch("/api/cart", {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({index, newVariant}),
      }),
    );
  };

  const removeFromCart = (index: number) => {
    cartAction(
      () => setCartItems(prev => reindex(prev.filter(i => i.index !== index))),
      () => fetch("/api/cart", {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({index}),
      }),
    );
  };

  const removeProduct = (productId: string) => {
    cartAction(
      () => setCartItems(prev => reindex(prev.filter(i => i.productId !== productId))),
      () => fetch("/api/cart", {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({productId}),
      }),
    );
  };

  const handleCheckout = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cart/checkout", {method: "POST"});
      const data = await res.json();
      if (res.ok) {
        setCoins(data.coins);
        setCartItems([]);
        setCartOpen(false);
        setMessage({type: "success", text: `Заказ оформлен! (${data.ordersCount} шт.)`});
        fetchProducts();
      } else {
        setMessage({type: "error", text: data.deficit ? `Не хватает ${data.deficit} монет` : (data.error || "Ошибка оформления")});
      }
    } catch {
      setMessage({type: "error", text: "Ошибка сети"});
    }
    setChecking(false);
  };

  const handleIncrement = (product: ProductData) => {
    const hasVariants = product.variants && Object.keys(product.variants).length > 0;
    if (hasVariants) {
      addToCart(product._id);
    } else {
      const existing = cartItems.find(i => i.productId === product._id);
      if (existing) updateCartQuantity(existing.index, existing.quantity + 1);
      else addToCart(product._id);
    }
  };

  const handleDecrement = (product: ProductData) => {
    const hasVariants = product.variants && Object.keys(product.variants).length > 0;
    if (hasVariants) {
      const items = cartItems.filter(i => i.productId === product._id);
      const last = items[items.length - 1];
      if (last) removeFromCart(last.index);
    } else {
      const existing = cartItems.find(i => i.productId === product._id);
      if (existing) updateCartQuantity(existing.index, existing.quantity - 1);
    }
  };

  const renderSortButtons = () => (
    <>
      <Button
        variant={sortBy.startsWith("price") ? "default" : "outline"}
        size="sm"
        className="gap-1 shrink-0 text-xs"
        onClick={() => {
          if (sortBy === "price-asc") setSortBy("price-desc");
          else if (sortBy === "price-desc") setSortBy("default");
          else setSortBy("price-asc");
        }}
      >
        {sortBy === "price-desc" ? <ArrowUp10 size={14}/> : <ArrowDown01 size={14}/>}
        Цена
      </Button>
      <Button
        variant={sortBy.startsWith("name") ? "default" : "outline"}
        size="sm"
        className="gap-1 shrink-0 text-xs"
        onClick={() => {
          if (sortBy === "name-asc") setSortBy("name-desc");
          else if (sortBy === "name-desc") setSortBy("default");
          else setSortBy("name-asc");
        }}
      >
        {sortBy === "name-desc" ? <ArrowUpZA size={14}/> : <ArrowDownAZ size={14}/>}
        Название
      </Button>
    </>
  );


  return (
    <div className="min-h-dvh">
      <div className="overflow-hidden fixed inset-0 -z-1 flex items-center justify-center">
        <div className="w-full h-full">
          <OrbAnimation scaleMode="max"/>
        </div>
      </div>
      <header className="sticky top-0 w-full border-b border-border/40 bg-background/80 backdrop-blur-md z-1  ">
        <div className="flex h-18 items-center justify-between gap-5 px-6 sm:px-10 max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" className="gap-1 shrink-0" asChild>
            <Link href="/profile">
              <ArrowLeft size={16}/>
              <span className="hidden sm:inline">Вернуться</span>
            </Link>
          </Button>
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
              <Input
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/70 border-border/40 text-white placeholder:text-muted-foreground"
              />
            </div>
            <div className="hidden sm:flex gap-1.5 w-fit overflow-x-auto no-scrollbar">
              {renderSortButtons()}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-background/70 border border-border/40 rounded-full px-3 py-1.5 text-sm">
              <Coins size={14} className="text-yellow-500"/>
              <span className="font-semibold">{coins}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart size={18}/>
              {totalCartItems > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center rounded-full">
                  {totalCartItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
        <div className="flex sm:hidden gap-1.5 overflow-x-auto no-scrollbar px-6 pb-2">
          {renderSortButtons()}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">

        <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-xl sm:rounded-2xl">
          <Image
            src="/banner.svg"
            alt="Новая коллекция мерча"
            width={1200}
            height={300}
            className="w-full h-auto object-cover"
            priority
          />
        </div>

        {message && (
          <div className={`px-4 py-3 rounded-xl text-sm ${
            message.type === "success"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={24} className="animate-spin text-muted-foreground"/>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
            <ShoppingBag size={32}/>
            <span>{searchQuery.trim() ? "Ничего не найдено" : "Товаров пока нет"}</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                cartQuantity={cartCountMap.get(product._id) || 0}
                onAdd={() => addToCart(product._id)}
                onIncrement={() => handleIncrement(product)}
                onDecrement={() => handleDecrement(product)}
                onClick={() => setSelected(product)}
              />
            ))}
          </div>
        )}
      </div>

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cartItems}
        coins={coins}
        checking={checking}
        onUpdateVariant={updateCartVariant}
        onRemove={removeFromCart}
        onRemoveProduct={removeProduct}
        onCheckout={handleCheckout}
      />

      <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader className="pr-8">
                <DialogTitle className="text-base sm:text-lg">{selected.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <ImageCarousel images={selected.images} alt={selected.name} className="aspect-square rounded-lg" mode="arrows"/>
                <p className="text-sm text-muted-foreground">{selected.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Coins size={16} className="text-yellow-500"/>
                    <span className="font-semibold text-lg">{selected.price}</span>
                  </div>
                  {(() => {
                    const qty = cartCountMap.get(selected._id) || 0;
                    return qty > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="icon-xs" onClick={() => handleDecrement(selected)}>
                          <Minus size={12}/>
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{qty}</span>
                        <Button variant="outline" size="icon-xs" onClick={() => handleIncrement(selected)}>
                          <Plus size={12}/>
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => addToCart(selected._id)}>
                        <Plus size={14}/>
                        В корзину
                      </Button>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
