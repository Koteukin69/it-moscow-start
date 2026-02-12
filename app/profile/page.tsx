import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@/lib/types";
import type { QuizResult } from "@/lib/types";
import ProfileCard from "@/components/profile-card";
import Back from "@/components/back";
import { quizResultsCollection } from "@/lib/db/collections";

export default async function Profile() {
  const h = await headers();
  const userId = h.get("x-user-id");

  if (!userId) redirect("/");

  const name = decodeURIComponent(h.get("x-user-name") ?? "");
  const phone = h.get("x-user-phone") || undefined;
  const role = Number(h.get("x-user-role") ?? "0") as Role;
  const verified = h.get("x-user-verified") === "true";

  const collection = await quizResultsCollection;
  const quizDoc = await collection.findOne({ userId });
  const quizResult: QuizResult | undefined = quizDoc
    ? { directions: quizDoc.directions, top: quizDoc.top, completedAt: quizDoc.completedAt.toISOString() }
    : undefined;

  return <>
    <Back/>
    <ProfileCard name={name} phone={phone} role={role} verified={verified} quizResult={quizResult} />
  </>;
}
