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

export default function Abit() {
  return (<Chat greeting={getMoscowGreeting()}/>);
}