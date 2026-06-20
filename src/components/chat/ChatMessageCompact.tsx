"use client";
import { Bot } from "lucide-react";

interface ChatMessageCompactProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export function ChatMessageCompact({ role, content }: ChatMessageCompactProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 py-4 ${isUser ? "" : "bg-slate-900/30"}`}>
      <div className="mx-auto flex w-full max-w-3xl gap-3 px-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white">
              Tú
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <Bot className="h-5 w-5" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 pt-1">
          <div className="text-sm leading-relaxed text-slate-100">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
