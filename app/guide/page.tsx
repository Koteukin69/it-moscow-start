import {headers} from "next/headers";
import {redirect} from "next/navigation";
import Guide from "@/components/guide";
import Back from "@/components/back";

export default async function GuidePage() {
  const h = await headers();
  const userId = h.get("x-user-id");

  if (!userId) redirect("/");

  return <>
    <Back/>
    <Guide/>
  </>;
}
