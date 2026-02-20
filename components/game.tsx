
export default function Game({userId}: { userId: string }) {
  return (<iframe
    src={`/api/game-assets/index.html?user=${userId}`}
    className={"w-screen h-screen border-none block bg-transparent"}
  />)
}