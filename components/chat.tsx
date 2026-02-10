export default function Chat({messages}: {messages: {message: string, sender: "client" | "server"}[]}) {
  return (<div className={"bg-background px-10 py-20 w-full h-screen flex flex-col gap-5"}>
    {messages?.map((message) => (
      message.message.split("\n").map((text, index: number) => (
        <div className={`${message.sender === "client" ? "self-end" : "self-start"}`} key={index}>
          <div className={`bg-accent py-2 px-4 rounded-xl ${message.sender === "client" ? "rounded-ee-xs" : "rounded-es-xs"}`}>
            {text}
          </div>
        </div>
      ))
    ))}
  </div>);
}