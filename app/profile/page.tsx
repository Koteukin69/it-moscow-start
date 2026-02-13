import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@/lib/types";
import type { QuizResult } from "@/lib/types";
import ProfileCard from "@/components/profile-card";
import Back from "@/components/back";
import { usersCollection, quizResultsCollection } from "@/lib/db/collections";
import { ObjectId } from "mongodb";

export default async function Profile() {
  const h = await headers();
  const userId = h.get("x-user-id");

  if (!userId) redirect("/");

  const name = decodeURIComponent(h.get("x-user-name") ?? "");
  const phone = h.get("x-user-phone") || undefined;
  const role = Number(h.get("x-user-role") ?? "0") as Role;
  const verified = h.get("x-user-verified") === "true";

  const isValidId = ObjectId.isValid(userId);
  const [users, quizCollection] = await Promise.all([usersCollection, quizResultsCollection]);
  const [userDoc, quizDoc] = await Promise.all([
    isValidId ? users.findOne({_id: new ObjectId(userId)}) : null,
    quizCollection.findOne({userId}),
  ]);

  const coins = userDoc?.coins ?? 0;
  const quizResult: QuizResult | undefined = quizDoc
    ? { directions: quizDoc.directions, top: quizDoc.top, completedAt: quizDoc.completedAt.toISOString() }
    : undefined;

  return <>
    <Back/>
    <ProfileCard name={name} phone={phone} role={role} verified={verified} coins={coins} quizResult={quizResult} />
  </>;
}
