"use client";
import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  responseTime?: number; // en milisegundos
  feedback?: "up" | "down";
}

interface ChatPanelProps {
  messages: Message[];
  isTyping: boolean;
  onClearChat: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onFeedback: (messageId: string, type: "up" | "down") => void;
  onRegenerate: (messageId: string) => void;
}

export function ChatPanel({ messages, isTyping, onClearChat, sidebarOpen, onToggleSidebar, onFeedback, onRegenerate }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex h-[calc(100vh-124px)] overflow-hidden">
      <aside className={`border-r border-slate-800 bg-slate-950/90 backdrop-blur-sm transition-all duration-200 ${sidebarOpen ? "w-64" : "w-16"}`}>
        <div className="flex h-full flex-col p-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-800"
            aria-label="Alternar sidebar"
          >
            ☰
          </button>
          {sidebarOpen && (
            <div className="space-y-2 text-sm text-slate-200">
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Conversaciones</p>
                <p className="mt-2 text-slate-100">Nueva charla</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Favoritos</p>
                <p className="mt-2 text-slate-100">Astronomía • Matemática</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Configuración</p>
                <p className="mt-2 text-slate-100">Local · Ollama · Voz</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/50 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 sm:text-base">Conversaciones</h2>
          <p className="text-[11px] text-slate-400">Respuesta local • Tiempo visible</p>
        </div>
        <button
          onClick={onClearChat}
          className="text-sm text-slate-400 transition-colors hover:text-red-400"
        >
          Limpiar chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center text-slate-300">
            <div className="mb-5 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-2xl shadow-slate-950/50">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl shadow-lg shadow-cyan-500/20">🧠</div>
              <p className="text-xl font-semibold text-slate-100">Jarvis está listo</p>
              <p className="mt-2 max-w-md text-sm text-slate-400">Haz una pregunta, pide ayuda o explora un tema. El tiempo de respuesta aparece automáticamente debajo de cada mensaje.</p>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {['Astronomía', 'Matemática', 'Hora', 'Calendario'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan-500/50 hover:bg-slate-800"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4">
            {messages.map((msg, idx) => {
              const prev = messages[idx - 1];
              const showDaySeparator = prev
                ? new Date(prev.timestamp).toDateString() !== new Date(msg.timestamp).toDateString()
                : true;

              return (
                <div key={msg.id}>
                  {showDaySeparator && (
                    <div className="my-3 flex items-center justify-center text-xs text-slate-500">
                      <span className="mx-3 inline-block h-px w-24 bg-slate-800" />
                      <span>{new Date(msg.timestamp).toLocaleDateString()}</span>
                      <span className="mx-3 inline-block h-px w-24 bg-slate-800" />
                    </div>
                  )}
                  <ChatMessage
                    key={msg.id}
                    messageId={msg.id}
                    role={msg.role}
                    content={msg.content}
                    timestamp={msg.timestamp}
                    responseTime={msg.responseTime}
                    onFeedback={onFeedback}
                    onRegenerate={onRegenerate}
                    feedback={msg.feedback}
                  />
                </div>
              );
            })}
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
      </section>
    </div>
  );
}
