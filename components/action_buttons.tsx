import {Button} from "@/components/ui/button";

export default function Action_buttons() {
  return (<div className="flex flex-wrap gap-2 max-w-sm">
    <Button className={"rounded-xl"} variant={"outline"}>Тест: Кто ты в IT?</Button>
    <Button className={"rounded-xl"} variant={"outline"}>Играть</Button>
    <Button className={"rounded-xl"} variant={"outline"}>Гид по профессиям умного города</Button>
    <Button className={"rounded-xl"} variant={"outline"}>Курсы IT.Москва School</Button>
    <Button className={"rounded-xl"} variant={"outline"}>FAQ</Button>
    <Button className={"rounded-xl"} variant={"outline"}>Наши мероприятия</Button>
    <Button className={"rounded-xl"} variant={"outline"}>Мой профиль</Button>
  </div>);
}