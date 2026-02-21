import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Back from "@/components/back";
import Game from "@/components/game"

const MOBILE_UA = /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry|Opera Mini|IEMobile/i;

export default async function GamePage() {
  const h = await headers();
  const userId = h.get("x-user-id");

  if (!userId) redirect("/applicant");

  const ua = h.get("user-agent") ?? "";
  const isMobile = MOBILE_UA.test(ua);

  return (<div className={"bg-background"}>
    <Game userId={userId} isMobile={isMobile} />
  </div>);
}
