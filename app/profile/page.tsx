import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { QuizResult } from "@/lib/types";
import ProfileCard from "@/components/profile-card";
import Back from "@/components/back";
import { prisma } from "@/lib/db/prisma";

type OAuthProvider = { provider: string; phone?: string; linkedAt: string };

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

  const [userDoc, quizDoc, orderDocs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.quizResult.findUnique({ where: { userId } }),
    prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);

  const coins = userDoc?.coins ?? 0;
  const avatar = userDoc?.avatar ?? undefined;
  const oauthProviders = ((userDoc?.oauthProviders as OAuthProvider[]) ?? []).map(p => ({
    provider: p.provider as "vk" | "yandex",
    linkedAt: p.linkedAt ?? new Date().toISOString(),
  }));
  const quizResult: QuizResult | undefined = quizDoc
    ? { directions: quizDoc.directions as Record<string, number>, top: quizDoc.top, completedAt: quizDoc.completedAt.toISOString() }
    : undefined;

  const orders: UserOrder[] = orderDocs.map(o => ({
    _id: o.id,
    orderNumber: o.orderNumber ?? 0,
    pickupCode: o.pickupCode ?? "",
    productName: o.productName,
    variant: o.variant || null,
    quantity: o.quantity || 1,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <>
      <Back link="/abit" />
      <ProfileCard
        name={name}
        coins={coins}
        avatar={avatar}
        quizResult={quizResult}
        orders={orders}
        oauthProviders={oauthProviders}
      />
    </>
  );
}
