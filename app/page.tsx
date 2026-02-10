import Nav from "@/components/nav";
import OrbAnimation from "@/components/orb";

export default function Home() {
  return (
  <div className={"flex items-center justify-center h-screen px-10 sm:px-20"}>
    <div className={"overflow-hidden absolute w-screen h-screen -z-1 flex items-center justify-center"}>
      <div className={"h-150 aspect-square"}>
        <OrbAnimation />
      </div>
    </div>
    <Nav/>
  </div>);
}
