import { headers } from "next/headers";
import FlyGame from "@/components/games/fly-game";

export default async function FlyPage() {
  const h = await headers();
  const userId = h.get("x-user-id") ?? undefined;
  return <FlyGame userId={userId} />;
}
