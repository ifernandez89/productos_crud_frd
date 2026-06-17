"use client";
import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  responseTime?: number; // en milisegundos
}

interface ChatPanelProps {
  messages: Message[];
  isTyping: boolean;
  onClearChat: () => void;
}

export function ChatPanel({ messages, isTyping, onClearChat }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/50 px-6 py-4 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-slate-200">Historial de Chat</h2>
        <button
          onClick={onClearChat}
          className="text-sm text-slate-400 hover:text-red-400 transition-colors"
        >
          Limpiar chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-500">
            <div className="mb-4 rounded-full bg-slate-800 p-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-12 w-12 opacity-50"
              >
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.137 0 4.252.139 6.337.408 1.922.25 3.29 1.86 3.405 3.72l.135 2.133c.214 3.378-1.288 6.54-3.578 8.34l-2.76 2.288c-1.539 1.273-3.76 1.273-5.297 0L8.34 18.26c-2.29-1.8-3.792-4.962-3.578-8.34l.135-2.133c.115-1.86 1.483-3.47 3.405-3.72zM12 15.75a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </div>
            <p className="text-lg">Tu chat está vacío</p>
            <p className="text-sm text-slate-500">Empieza una conversación ahora</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
                responseTime={msg.responseTime}
              />
            ))}
            {isTyping && (
              <ChatMessage
                role="assistant"
                content=""
                timestamp={new Date()}
                isTyping={true}
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
