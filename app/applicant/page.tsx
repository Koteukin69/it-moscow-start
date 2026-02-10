import Nav from "@/components/nav";
import OrbAnimation from "@/components/orb";
import Chat from "@/components/chat";

const messages: {message: string, sender: "client" | "server"}[] = [
  {message: "Я - абитуриент", sender: "client"},
  {message: "Давай познакомимся!\n Напиши своё имя (или придумай ник) и номер телефона.", sender: "server"}
]

export default function Applicant() {
  return (<div className="flex align-center h-screen">
    <div className={"overflow-hidden absolute -inset-x-[20%] w-screen h-screen -z-1 flex items-center justify-start"}>
      <div className={"h-screen aspect-square"}>
        <OrbAnimation  />
      </div>
    </div>
    <div className={"w-full max-w-sm hidden md:flex"}>
      <Nav/>
    </div>
    <Chat messages={messages}/>
  </div>);
}