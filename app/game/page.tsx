import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Back from "@/components/back";
import Game from "@/components/game"
export default async function GamePage() {
  const h = await headers();
  const userId = h.get("x-user-id");

  if (!userId) redirect("/applicant");

  return (<div className={"bg-background"}>
    <Back/>
    <Game userId={userId} />
  </div>);
}
