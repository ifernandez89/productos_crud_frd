"use client";
import { useState, useRef, useEffect } from "react";
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
  maxLength: number;
  errorMessage?: string;
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
  maxLength,
  errorMessage,
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
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pb-4 pt-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Input bar */}
        <form
          onSubmit={handleSubmit}
          className={`relative rounded-3xl border bg-slate-900/95 p-2 shadow-xl shadow-slate-950/40 transition-all duration-200 ${
            isFocused
              ? "border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.15)]"
              : "border-slate-700/80"
          }`}
        >
          <div className="flex items-start gap-2 px-1 pb-1 pt-1">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className="w-full resize-none bg-transparent px-2 py-2 text-[15px] text-slate-100 placeholder-slate-500 focus:outline-none"
              rows={1}
              style={{ minHeight: "46px" }}
              maxLength={maxLength}
            />

            <div className="flex items-center gap-1 pt-1">
            <button
              type="button"
              onClick={isListening ? onVoiceStop : onVoiceStart}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:-translate-y-0.5 ${
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
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:-translate-y-0.5 ${
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
          </div>

          {errorMessage && (
            <p className="px-3 pb-1 text-xs text-red-400">{errorMessage}</p>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-slate-800/80 px-2 pb-2 pt-2">
            {[
              { label: "📎 Imagen", action: "image" as const },
              { label: "🔍 Buscar", action: "search" as const },
              { label: "🎤 Voz", action: "voice" as const },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() =>
                  chip.action === "voice"
                    ? isListening
                      ? onVoiceStop()
                      : onVoiceStart()
                    : onActionClick(chip.action)
                }
                className="rounded-full border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs text-slate-200 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:bg-slate-700"
              >
                {chip.label}
              </button>
            ))}
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
