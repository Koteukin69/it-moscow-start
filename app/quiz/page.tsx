import {headers} from "next/headers";
import {redirect} from "next/navigation";
import Quiz from "@/components/quiz";
import Back from "@/components/back";

export default async function QuizPage() {
  const h = await headers();
  const userId = h.get("x-user-id");

  if (!userId) redirect("/");

  return <>
    <Back/>
    <Quiz/>
  </>;
}
