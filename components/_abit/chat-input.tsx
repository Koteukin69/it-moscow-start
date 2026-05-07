"use client";

import {ChangeEventHandler} from "react";
import type { KeyboardEventHandler } from "react";
import { Square, Play } from 'lucide-react';

export default function ChatInput({onChange, value, onSubmit, thinking}: {onChange?: ChangeEventHandler<HTMLTextAreaElement, HTMLTextAreaElement> | undefined, value?: string, onSubmit?: () => void, thinking?: boolean}) {
  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key !== "Enter") return;
    if (e.shiftKey) return;

    e.preventDefault();
    if (!value?.trim() && !thinking) return;
    onSubmit?.();
  };

  return (<div className={"w-full h-25 relative"}>
    <textarea
      value={value}
      onChange={onChange}
      placeholder="Как я могу вам помочь?"
      className={"absolute inset-0 resize-none px-4 py-3 pr-10 text-[16px] text-white bg-white/10 placeholder:text-white/50 rounded-[10px] outline-none"}
      name={"chat-input"}
      onKeyDown={value?.trim() || thinking ? handleKeyDown : undefined}
    />
    <button
      className={`absolute right-2.5 bottom-2.5 z-1 w-7.5 aspect-square flex justify-center items-center ${thinking && !value ? "bg-[#FF3204]" : "bg-[#7B9EFF]"} ${!value && "opacity-50"} rounded-[5px] ${value?.trim() || thinking ? "cursor-pointer" : ""}`}
      onClick={value?.trim() || thinking ? onSubmit : undefined}
    >
      {thinking && !value ? <Square /> : <Play />}
    </button>
  </div>);
}
