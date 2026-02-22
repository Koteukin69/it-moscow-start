import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {usersCollection, cartsCollection, productsCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";
import Shop from "@/components/shop";
import type {CartWithProducts} from "@/lib/types";

export default async function ShopPage() {
  const h = await headers();
  const userId = h.get("x-user-id");

  if (!userId) redirect("/");

  const [users, carts, products] = await Promise.all([
    usersCollection, cartsCollection, productsCollection,
  ]);

  const user = await users.findOne({_id: new ObjectId(userId)});
  const coins = user?.coins ?? 0;

  const cart = await carts.findOne({userId});
  const cartItems = cart?.items ?? [];

  let enrichedCart: CartWithProducts = {items: []};

  if (cartItems.length > 0) {
    const productIds = cartItems.map(i => {
      try { return new ObjectId(i.productId); } catch { return null; }
    }).filter(Boolean) as ObjectId[];

    const productDocs = await products.find({_id: {$in: productIds}}).toArray();
    const productMap = new Map(productDocs.map(p => [p._id.toString(), p]));

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
            images: Array.isArray(product.images) ? product.images : [],
            variants: product.variants || null,
            variantLabel: product.variantLabel || null,
            stock: product.stock ?? null,
          };
        })
        .filter(Boolean) as CartWithProducts["items"],
    };
  }

  return <Shop initialCoins={coins} initialCart={enrichedCart}/>;
}
