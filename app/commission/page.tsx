import {headers} from "next/headers";
import {redirect} from "next/navigation";
import CommissionLogin from "@/components/commission-login";

export default async function CommissionPage() {
  const h = await headers();
  const isCommission = h.get("x-commission") === "true";

  if (isCommission) {
    redirect("/commission/dashboard");
  }

  return <CommissionLogin/>;
}
