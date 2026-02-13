import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import Image from "next/image"

export default function Nav() {
  return (
  <Card className="w-full bg-background/70 justify-center">
    <CardHeader className={"flex justify-center"}>
      <Image className={"w-[80%] aspect-18258/9871 my-5"} src={"logo.svg"} width={18258} height={9871} alt={"logo"}/>
    </CardHeader>
    <CardContent className="flex flex-col gap-3">
      <Button size={"lg"} variant={"outline"} asChild><a href={"/applicant"}>Я - абитуриент</a></Button>
      <Button size={"lg"} variant={"outline"} asChild><a href={"/commission"}>Я - приёмная комиссия</a></Button>
    </CardContent>
  </Card>);
}