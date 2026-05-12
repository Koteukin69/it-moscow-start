import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Shop from "@/components/shop";
import type { CartWithProducts } from "@/lib/types";

type CartItem = { productId: string; quantity: number; variant?: string };

const ALLOWED_BACK_URLS = new Set(["/profile", "/abit", "/store"]);

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const h = await headers();
  const userId = h.get("x-user-id");
  const params = await searchParams;
  const from = params.from ?? "";
  const backUrl = ALLOWED_BACK_URLS.has(from) ? from : "/profile";

  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { coins: true } });
  const coins = user?.coins ?? 0;

  const cart = await prisma.cart.findUnique({ where: { userId } });
  const cartItems = (cart?.items as CartItem[]) ?? [];

  let enrichedCart: CartWithProducts = { items: [] };

  if (cartItems.length > 0) {
    const productIds = [...new Set(cartItems.map(i => i.productId))];
    const productDocs = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(productDocs.map(p => [p.id, p]));

    enrichedCart = {
      items: cartItems
        .map((item, index) => {
          const product = productMap.get(item.productId);
          if (!product) return null;
          return {
            index,
            productId: item.productId,
            quantity: item.quantity,
            variant: item.variant || undefined,
            name: product.name,
            price: product.price,
            images: Array.isArray(product.images) ? (product.images as string[]) : [],
            variants: (product.variants as Record<string, number> | null) || null,
            variantLabel: product.variantLabel || null,
            stock: product.stock ?? null,
          };
        })
        .filter(Boolean) as CartWithProducts["items"],
    };
  }

  return <Shop initialCoins={coins} initialCart={enrichedCart} backUrl={backUrl} />;
}
