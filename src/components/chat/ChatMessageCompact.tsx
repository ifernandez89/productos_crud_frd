"use client";
import { Clock } from "lucide-react";
import Image from "next/image";

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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-600/10 p-1.5">
              <Image 
                src="/JarBees_logo.png" 
                alt="JarBees" 
                width={24} 
                height={24} 
                className="object-contain"
              />
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
