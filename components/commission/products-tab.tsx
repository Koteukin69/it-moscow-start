'use client';

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {RefreshCw, Loader2, ShoppingBag} from "lucide-react";

interface ProductData {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string | null;
  stock: number | null;
  sizes: Record<string, number> | null;
}

export default function ProductsTab() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

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
        <Button variant="outline" size="icon" onClick={fetchProducts} disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>}
        </Button>
      </div>

      <Card className="bg-background/70 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Название</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Остаток / по размерам</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 size={20} className="animate-spin mx-auto text-muted-foreground"/>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ShoppingBag size={24}/>
                      <span>Нет товаров</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map(product => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{product.price} ₽</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {product.description}
                    </TableCell>
                    <TableCell>{formatStock(product)}</TableCell>
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
    </div>
  );
}
