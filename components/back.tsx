import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function Back() {
  return (<Button className={"absolute left-5 top-5 md:text-lg md:left-10 md:top-10 z-1"} variant={"link"} asChild>
    <Link href={"/applicant"}>Вернуться</Link>
  </Button>);
}