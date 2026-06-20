"use client";
import { Bot, Clock } from "lucide-react";

interface ChatMessageCompactProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  responseTime?: number;
}

export function ChatMessageCompact({ role, content, responseTime }: ChatMessageCompactProps) {
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
        <div className="min-w-0 flex-1">
          <div className="text-sm leading-relaxed text-slate-100">
            {content}
          </div>
          {!isUser && responseTime && (
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {(responseTime / 1000).toFixed(2)}s
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
