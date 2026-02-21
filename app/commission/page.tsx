import {headers} from "next/headers";
import {redirect} from "next/navigation";
import CommissionLogin from "@/components/commission-login";
import OrbAnimation from "@/components/orb";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default async function CommissionPage() {
  const h = await headers();
  const isCommission = h.get("x-commission") === "true";

  if (isCommission) {
    redirect("/commission/dashboard");
  }

  return (<>
    <div className="absolute w-full flex justify-between shrink-0 items-center gap-3 border-b border-border px-5 py-4">
      <Button variant="link" asChild><Link href="/">Вернуться</Link></Button>
      <Image className={"max-w-10 aspect-square"} alt={"logo square"} src={"logo-square.svg"} width={64} height={64}/>
    </div>
    <div className={"flex flex-col items-center justify-center h-screen px-10 sm:px-20"}>
      <div className={"overflow-hidden absolute w-screen h-screen -z-1 flex items-center justify-center"}>
        <div className={"h-screen aspect-square"}>
          <OrbAnimation />
        </div>
      </div>
      <div className={"flex items-center justify-center w-full max-w-sm"}>
        <CommissionLogin />
      </div>
    </div>
  </>);
}
