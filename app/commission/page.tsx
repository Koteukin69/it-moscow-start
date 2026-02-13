import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {Role} from "@/lib/types";
import CommissionLogin from "@/components/commission-login";

export default async function CommissionPage() {
  const h = await headers();
  const role = Number(h.get("x-user-role") ?? "-1");

  if (role === Role.commission) {
    redirect("/commission/dashboard");
  }

  return <CommissionLogin/>;
}
