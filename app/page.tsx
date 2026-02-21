import Nav from "@/components/nav";
import OrbAnimation from "@/components/orb";

export default function Home() {
  return (
  <div className={"flex items-center justify-center h-dvh px-10 sm:px-20"}>
    <div className={"overflow-hidden absolute w-screen h-dvh -z-1 flex items-center justify-center"}>
      <div className={"h-dvh aspect-square"}>
        <OrbAnimation  />
      </div>
    </div>
    <div className={"flex items-center justify-center w-full max-w-sm"}>
      <Nav/>
    </div>
  </div>);
}
