import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

export default function Nav() {
  return (
  <Card className="w-full max-w-sm bg-background/80">
    <CardHeader>
      <CardTitle>Представьтесь пожалуйста</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col gap-3">
      <Button variant={"outline"}>Я - абитуриент</Button>
      <Button variant={"outline"}>Я - родитель</Button>
      <Button variant={"outline"}>Я - приёмная комиссия</Button>
    </CardContent>
  </Card>);
}