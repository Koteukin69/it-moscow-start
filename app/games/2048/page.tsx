import { headers } from "next/headers";
import Game2048 from "@/components/games/game-2048";

export default async function Game2048Page() {
  const h = await headers();
  const userId = h.get("x-user-id") ?? undefined;
  return <Game2048 userId={userId} />;
}
