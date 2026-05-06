import Title from "@/components/_home/components/title";
import {Skeleton} from "@/components/ui/skeleton";

export default function Events() {
  return (<>
    <Title
      title={"Ближайшие события ИТ.МОСКВА!"}
      description={"[Запишись на одно из них](/events) и попробуй себя в роли студента колледжа ИТ.МОСКВА"}
    />
    <div className="flex flex-row flex-nowrap  max-w-6xl gap-5 md:gap-10 w-full">
      <div className={"w-sm"}>
        <Skeleton className={"w-full aspect-square rounded-full"}/>
        Название события
      </div>
      <div className={"w-sm"}>
        <Skeleton className={"w-full aspect-square rounded-full"}/>
        Название события
      </div>
      <div className={"w-sm"}>
        <Skeleton className={"w-full aspect-square rounded-full"}/>
        Название события
      </div>
      <div className={"w-sm"}>
        <Skeleton className={"w-full aspect-square rounded-full"}/>
        Название события
      </div>
    </div>
  </>);
}