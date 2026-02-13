import {headers} from "next/headers";
import {redirect} from "next/navigation";
import CommissionDashboard from "@/components/commission/dashboard";

export default async function CommissionDashboardPage() {
  const h = await headers();
  const isCommission = h.get("x-commission") === "true";

  if (!isCommission) {
    redirect("/commission");
  }

  return <CommissionDashboard/>;
}
