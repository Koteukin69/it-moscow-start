import Image from "next/image";
import Link from "next/link";
import Title from "@/components/_home/components/title";

interface EventItem {
  id: string;
  name: string;
  date: string;
  image: string | null;
}

export default function Events({ events }: { events: EventItem[] }) {
  return (
    <>
      <Title
        title={"Ближайшие события ИТ.МОСКВА!"}
        description={"[Запишись на одно из них](/events) и попробуй себя в роли студента колледжа ИТ.МОСКВА"}
      />
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="flex flex-row flex-nowrap gap-5 md:gap-8 justify-start md:justify-center min-w-max md:min-w-0 px-2">
          {events.map(event => (
            <Link
              key={event.id}
              href="/events"
              className="flex flex-col items-center gap-3 group flex-shrink-0 w-28 sm:w-36 md:w-40"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden bg-white/20 border-2 border-white/30 group-hover:border-white/60 transition-colors flex items-center justify-center">
                {event.image ? (
                  <Image
                    src={event.image}
                    alt={event.name}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40 text-4xl font-bold">
                    {event.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-center text-xs sm:text-sm font-medium leading-tight line-clamp-2 text-white/90 group-hover:text-white transition-colors">
                {event.name}
              </span>
            </Link>
          ))}
          {events.length === 0 && (
            <p className="text-white/50 text-sm py-8">Мероприятий пока нет</p>
          )}
        </div>
      </div>
    </>
  );
}
