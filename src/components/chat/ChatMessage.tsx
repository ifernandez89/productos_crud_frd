"use client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  responseTime?: number; // en milisegundos
}

export function ChatMessage({ role, content, timestamp, isTyping = false, responseTime }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex w-full gap-4 p-6 ${
        isUser ? "bg-transparent" : "bg-slate-900/50"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isUser
            ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
            : "bg-gradient-to-br from-emerald-500 to-green-600 text-white"
        }`}
      >
        {isUser ? "Tú" : "IA"}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">
            {isUser ? "Tú" : "Asistente IA"}
          </span>
          <span className="text-xs text-slate-500">
            {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {!isUser && responseTime && !isTyping && (
            <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              ⚡ {(responseTime / 1000).toFixed(2)}s
            </span>
          )}
        </div>

        <div
          className={`prose max-w-none rounded-2xl p-4 text-slate-300 ${
            isUser
              ? "bg-slate-800/50"
              : "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50"
          }`}
        >
          {isTyping ? (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "0ms" }}></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "150ms" }}></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: "300ms" }}></span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
