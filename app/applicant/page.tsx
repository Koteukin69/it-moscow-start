import {headers} from "next/headers";
import ApplicantChat from "@/components/applicant-chat";

export default async function Applicant() {
  const h = await headers();
  const rawName = h.get("x-user-name");
  const name = rawName ? decodeURIComponent(rawName) : null;
  const userId = h.get("x-user-id") || undefined;
  const user = name && userId ? {name} : null;

  return <ApplicantChat user={user} userId={userId}/>;
}
