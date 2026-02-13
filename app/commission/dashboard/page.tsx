import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {Role} from "@/lib/types";
import CommissionDashboard from "@/components/commission/dashboard";

export default async function CommissionDashboardPage() {
  const h = await headers();
  const role = Number(h.get("x-user-role") ?? "-1");

  if (role !== Role.commission) {
    redirect("/commission");
  }

  return <CommissionDashboard/>;
}
