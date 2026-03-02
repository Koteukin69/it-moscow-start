import {headers} from "next/headers";
import {redirect} from "next/navigation";
import type {QuizResult} from "@/lib/types";
import ProfileCard from "@/components/profile-card";
import Back from "@/components/back";
import {usersCollection, quizResultsCollection, ordersCollection} from "@/lib/db/collections";
import {ObjectId} from "mongodb";

export interface UserOrder {
  _id: string;
  orderNumber: number;
  pickupCode: string;
  productName: string;
  variant: string | null;
  quantity: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
}

export default async function Profile() {
  const h = await headers();
  const userId = h.get("x-user-id");

  if (!userId) redirect("/");

  const name = decodeURIComponent(h.get("x-user-name") ?? "");

  const [users, quizCollection, ordersCol] = await Promise.all([usersCollection, quizResultsCollection, ordersCollection]);
  const [userDoc, quizDoc, orderDocs] = await Promise.all([
    users.findOne({_id: new ObjectId(userId)}),
    quizCollection.findOne({userId}),
    ordersCol.find({userId}).sort({createdAt: -1}).toArray(),
  ]);

  const coins = userDoc?.coins ?? 0;
  const avatar = userDoc?.avatar;
  const oauthProviders = (userDoc?.oauthProviders ?? []).map(p => ({
    provider: p.provider,
    linkedAt: p.linkedAt instanceof Date ? p.linkedAt.toISOString() : String(p.linkedAt),
  }));
  const quizResult: QuizResult | undefined = quizDoc
    ? {directions: quizDoc.directions, top: quizDoc.top, completedAt: quizDoc.completedAt.toISOString()}
    : undefined;

  const orders: UserOrder[] = orderDocs.map(o => ({
    _id: o._id.toString(),
    orderNumber: o.orderNumber ?? 0,
    pickupCode: o.pickupCode ?? "",
    productName: o.productName,
    variant: o.variant || null,
    quantity: o.quantity || 1,
    status: o.status,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
  }));

  return <>
    <Back/>
    <ProfileCard
      name={name}
      coins={coins}
      avatar={avatar}
      quizResult={quizResult}
      orders={orders}
      oauthProviders={oauthProviders}
    />
  </>;
}
