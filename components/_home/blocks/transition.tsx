import TransitionImage from "../components/transition-image"
import React from "react";

export default function Transition({
  ...props
                                   }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={"w-full overflow-clip"} {...props}>
    <TransitionImage className="w-full h-37.5"/>
  </div>
}