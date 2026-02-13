import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {usersCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";
import Shop from "@/components/shop";
import Back from "@/components/back";

export default async function ShopPage() {
  const h = await headers();
  const userId = h.get("x-user-id");

  if (!userId || !ObjectId.isValid(userId)) redirect("/");

  const collection = await usersCollection;
  const user = await collection.findOne({_id: new ObjectId(userId)});
  const coins = user?.coins ?? 0;

  return <>
    <Back/>
    <Shop initialCoins={coins}/>
  </>;
}
