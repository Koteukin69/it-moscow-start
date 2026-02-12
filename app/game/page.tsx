import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function GamePage() {
  const h = await headers();
  const userId = h.get("x-user-id");

  if (!userId) redirect("/applicant");

  return (
    <iframe
      src={`/api/game-assets/index.html?user=${userId}`}
      style={{ width: "100vw", height: "100vh", border: "none", display: "block" }}
      allowFullScreen
    />
  );
}
