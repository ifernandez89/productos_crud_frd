"use client";
import { useState, useRef, useEffect } from "react";
import { ActionButton } from "./ActionButton";
import { AudioControls } from "./AudioControls";

interface ChatInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onVoiceStart: () => void;
  onVoiceStop: () => void;
  isListening: boolean;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  isSpeaking: boolean;
  onToggleSpeaking: () => void;
  onActionClick: (action: "image" | "write" | "search") => void;
}

export function ChatInputBar({
  value,
  onChange,
  onSubmit,
  onVoiceStart,
  onVoiceStop,
  isListening,
  audioEnabled,
  onToggleAudio,
  isSpeaking,
  onToggleSpeaking,
  onActionClick,
}: ChatInputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pb-6 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Acciones rápidas */}
        <div className="mb-4 flex justify-center gap-4 sm:gap-6">
          <ActionButton
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path d="M1.5 5.25a3 3 0 013-3h15a3 3 0 013 3v13.5a3 3 0 01-3 3h-15a3 3 0 01-3-3V5.25zM12 12.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM18.375 19.125a.75.75 0 00-1.05-1.05l-2.25 2.25a.75.75 0 001.05 1.05l2.25-2.25zM12 16.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM6.375 19.125a.75.75 0 00-1.05-1.05l-2.25 2.25a.75.75 0 001.05 1.05l2.25-2.25z" />
              </svg>
            }
            label="Imagen"
            onClick={() => onActionClick("image")}
          />
          <ActionButton
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path d="M11.7 2.805a.75.75 0 01.6 0A27.2 27.2 0 0112 4.08c2.565.313 5.056.755 7.47 1.349a.75.75 0 01.531 1.145l-1.937 1.938a.75.75 0 00-.176.53c.24.804.461 1.625.66 2.46a.75.75 0 01-.721.996H3.889a.75.75 0 01-.721-.996c.199-.835.42-1.656.66-2.46a.75.75 0 00-.176-.53L.544 4.33a.75.75 0 01.531-1.145A27.2 27.2 0 0112 4.08c2.565.313 5.056.755 7.47 1.349z" />
              </svg>
            }
            label="Escribir"
            onClick={() => onActionClick("write")}
          />
          <ActionButton
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path
                  fillRule="evenodd"
                  d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                  clipRule="evenodd"
                />
              </svg>
            }
            label="Buscar"
            onClick={() => onActionClick("search")}
          />
        </div>

        {/* Input bar */}
        <form
          onSubmit={handleSubmit}
          className={`relative flex items-end gap-2 rounded-2xl border bg-slate-900 p-2 shadow-lg transition-all duration-200 ${
            isFocused
              ? "border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              : "border-slate-700"
          }`}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje..."
            className="w-full resize-none bg-transparent px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
            rows={1}
            style={{ minHeight: "44px" }}
          />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={isListening ? onVoiceStop : onVoiceStart}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                isListening
                  ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
              title={isListening ? "Detener grabación" : "Grabar voz"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v5.25a3.75 3.75 0 11-7.5 0V4.5z" />
                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.75 6.75 0 01-6.75 6.75h-4.5A6.75 6.75 0 016 16.5v-1.5a.75.75 0 01.75-.75z" />
              </svg>
            </button>

            <button
              type="submit"
              disabled={!value.trim()}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                value.trim()
                  ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.6)] hover:bg-cyan-400"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.984.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Audio controls */}
        <div className="mt-3 flex justify-center">
          <AudioControls
            audioEnabled={audioEnabled}
            onToggleAudio={onToggleAudio}
            isSpeaking={isSpeaking}
            onToggleSpeaking={onToggleSpeaking}
          />
        </div>
      </div>
    </div>
  );
}
