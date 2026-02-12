import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function ActionButtons() {
  return (<div className="flex flex-wrap gap-2 max-w-sm">
    <Button className={"rounded-xl"} variant={"outline"} asChild><Link href={"/quiz"}>Тест: Кто ты в IT?</Link></Button>
    <Button className={"rounded-xl"} variant={"outline"} asChild><Link href={"/faq"}>FAQ</Link></Button>
    <Button className={"rounded-xl"} variant={"outline"} asChild><Link href={"/guide"}>Гид по профессиям умного города</Link></Button>
    <Button className={"rounded-xl"} variant={"outline"} asChild><Link href={"/courses"}>Курсы IT.Москва School</Link></Button>
    <Button className={"rounded-xl"} variant={"secondary"}>Играть</Button>
    <Button disabled className={"rounded-xl"} variant={"outline"}>Наши мероприятия</Button>
    <Button className={"rounded-xl"} variant={"outline"} asChild><Link href={"/profile"}>Мой профиль</Link></Button>
  </div>);
}