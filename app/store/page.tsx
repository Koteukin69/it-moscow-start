import { headers } from "next/headers";
import GameStore from "@/components/game-store";
import { prisma } from "@/lib/db/prisma";

export default async function StorePage() {
  const h = await headers();
  const userId = h.get("x-user-id") ?? undefined;

  let userAvatar: string | undefined;
  if (userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { avatar: true } });
      userAvatar = user?.avatar ?? undefined;
    } catch (err) {
      console.error("[store] avatar fetch error", err);
    }
  }

  return <GameStore userId={userId} userAvatar={userAvatar} />;
}
