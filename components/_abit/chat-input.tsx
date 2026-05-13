"use client";

import { ChangeEventHandler, useRef } from "react";
import type { KeyboardEventHandler } from "react";
import { Paperclip, Play, Square, X } from "lucide-react";

const ACCEPT_FILE_TYPES = ".pdf,.docx,.xlsx,.txt,.csv";

interface ChatInputProps {
  onChange?: ChangeEventHandler<HTMLTextAreaElement, HTMLTextAreaElement>;
  value?: string;
  onSubmit?: () => void;
  thinking?: boolean;
  disabled?: boolean;
  fileAttached?: { name: string; size: number } | null;
  onAttachFile?: (file: File | null) => void;
  attachEnabled?: boolean;
}

export default function ChatInput({
  onChange,
  value,
  onSubmit,
  thinking,
  disabled,
  fileAttached,
  onAttachFile,
  attachEnabled,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key !== "Enter") return;
    if (e.shiftKey) return;

    e.preventDefault();
    if (!value?.trim() && !thinking && !fileAttached) return;
    onSubmit?.();
  };

  const canSend = !!(value?.trim() || fileAttached || thinking);

  return (
    <div className={`w-full relative ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      {fileAttached && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white/80">
          <Paperclip size={14} className="text-[#7B9EFF]" />
          <span className="truncate flex-1">{fileAttached.name}</span>
          <span className="text-xs text-white/40">{(fileAttached.size / 1024).toFixed(0)} KB</span>
          <button
            onClick={() => onAttachFile?.(null)}
            className="text-white/40 hover:text-white transition-colors"
            title="Убрать файл"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="h-25 relative">
        <textarea
          value={value}
          onChange={onChange}
          placeholder={disabled ? "Лимит вопросов исчерпан. Войдите, чтобы продолжить." : "Как я могу вам помочь?"}
          className={`absolute inset-0 resize-none ${attachEnabled ? "pl-11" : "pl-4"} pr-10 py-3 text-[16px] text-white bg-white/10 placeholder:text-white/50 rounded-[10px] outline-none`}
          name="chat-input"
          disabled={disabled}
          onKeyDown={canSend ? handleKeyDown : undefined}
        />

        {attachEnabled && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_FILE_TYPES}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                onAttachFile?.(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute left-2.5 bottom-2.5 z-1 w-7.5 aspect-square flex justify-center items-center bg-white/15 hover:bg-white/25 rounded-[5px] cursor-pointer text-white/80 transition-colors"
              title="Прикрепить файл (pdf, docx, xlsx, txt, csv)"
            >
              <Paperclip size={16} />
            </button>
          </>
        )}

        <button
          className={`absolute right-2.5 bottom-2.5 z-1 w-7.5 aspect-square flex justify-center items-center ${thinking && !value && !fileAttached ? "bg-[#FF3204]" : "bg-[#7B9EFF]"} ${!canSend && "opacity-50"} rounded-[5px] ${canSend ? "cursor-pointer" : ""}`}
          onClick={canSend ? onSubmit : undefined}
        >
          {thinking && !value && !fileAttached ? <Square /> : <Play />}
        </button>
      </div>
    </div>
  );
}
