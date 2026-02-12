import { headers } from "next/headers";
import ApplicantChat from "@/components/applicant-chat";

export default async function Applicant() {
  const h = await headers();
  const rawName = h.get("x-user-name");
  const name = rawName ? decodeURIComponent(rawName) : null;
  const phone = h.get("x-user-phone") || undefined;

  const user = name ? { name, phone } : null;

  return <ApplicantChat user={user} />;
}
