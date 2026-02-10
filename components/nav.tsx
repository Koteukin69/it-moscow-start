import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import Image from "next/image"

export default function Nav() {
  return (
  <Card className="w-full max-w-sm bg-background/80">
    <CardHeader className={"flex justify-center"}>
      <Image className={"w-[80%] my-5"} src={"logo.svg"} width={4010} height={464} alt={"logo"}/>
    </CardHeader>
    <CardContent className="flex flex-col gap-3">
      <Button size={"lg"} variant={"outline"}>Я - абитуриент</Button>
      <Button size={"lg"} variant={"outline"}>Я - родитель</Button>
      <Button size={"lg"} variant={"outline"}>Я - приёмная комиссия</Button>
    </CardContent>
  </Card>);
}