import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { usersCollection } from "@/lib/db/collections";
import Chat from "@/components/_abit/chat";

function getMoscowGreeting(date = new Date()) {
  const hourText = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    hour12: false,
  }).format(date);

  const hour = Number(hourText) % 24;

  if (hour >= 5 && hour < 12) return "Доброе утро!";
  if (hour >= 12 && hour < 18) return "Добрый день!";
  if (hour >= 18 && hour < 23) return "Добрый вечер!";

  return "Доброй ночи!";
}

export default async function Abit() {
  const h = await headers();
  const userId = h.get("x-user-id") ?? undefined;
  const rawName = h.get("x-user-name") ?? undefined;
  const userName = rawName ? decodeURIComponent(rawName) : undefined;

  let userAvatar: string | undefined;
  if (userId) {
    try {
      const collection = await usersCollection;
      const user = await collection.findOne(
        { _id: new ObjectId(userId) },
        { projection: { avatar: 1 } },
      );
      userAvatar = user?.avatar ?? undefined;
    } catch {
      // non-critical — sidebar still renders with initials fallback
    }
  }

  return (
    <Chat
      greeting={getMoscowGreeting()}
      userId={userId}
      userName={userName}
      userAvatar={userAvatar}
    />
  );
}
