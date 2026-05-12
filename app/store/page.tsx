import { headers } from "next/headers";
import GameStore from "@/components/game-store";

export default async function StorePage() {
  const h = await headers();
  const userId = h.get("x-user-id") ?? undefined;

  return <GameStore userId={userId} />;
}
