"use client";
import { useState } from "react";
import { Send, Plus, Mic, Image as ImageIcon, Search, FileText, Brain, Settings } from "lucide-react";

interface ChatInputSimpleProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onVoiceToggle: () => void;
  isListening: boolean;
  isTyping: boolean;
}

export function ChatInputSimple({
  value,
  onChange,
  onSubmit,
  onVoiceToggle,
  isListening,
  isTyping,
}: ChatInputSimpleProps) {
  const [showTools, setShowTools] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const tools = [
    { icon: ImageIcon, label: "Imagen", action: () => console.log("Imagen") },
    { icon: Search, label: "Buscar Web", action: () => console.log("Web") },
    { icon: FileText, label: "Documentos", action: () => console.log("Docs") },
    { icon: Brain, label: "Memoria", action: () => console.log("Memoria") },
    { icon: Settings, label: "Herramientas", action: () => console.log("Config") },
  ];

  return (
    <div className="border-t border-slate-800 bg-slate-950 px-4 py-3">
      <div className="mx-auto max-w-3xl">
        {/* Tools menu */}
        {showTools && (
          <div className="mb-3 flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
            {tools.map((tool) => (
              <button
                key={tool.label}
                onClick={tool.action}
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-cyan-500/30 hover:bg-slate-800 hover:text-cyan-400"
              >
                <tool.icon className="h-4 w-4" />
                {tool.label}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="flex items-end gap-2">
          {/* Plus button */}
          <button
            onClick={() => setShowTools(!showTools)}
            className={`flex-shrink-0 rounded-full p-2.5 transition-colors ${
              showTools
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-300"
            }`}
            title="Herramientas"
          >
            <Plus className={`h-5 w-5 transition-transform ${showTools ? "rotate-45" : ""}`} />
          </button>

          {/* Text input */}
          <div className="relative flex-1">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              disabled={isTyping}
              rows={1}
              className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-50"
              style={{
                maxHeight: "200px",
                minHeight: "44px",
              }}
            />
          </div>

          {/* Voice button */}
          <button
            onClick={onVoiceToggle}
            disabled={isTyping}
            className={`flex-shrink-0 rounded-full p-2.5 transition-colors ${
              isListening
                ? "animate-pulse bg-red-500/20 text-red-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-300 disabled:opacity-50"
            }`}
            title={isListening ? "Detener grabación" : "Grabar voz"}
          >
            <Mic className="h-5 w-5" />
          </button>

          {/* Send button */}
          <button
            onClick={onSubmit}
            disabled={!value.trim() || isTyping}
            className="flex-shrink-0 rounded-full bg-cyan-500 p-2.5 text-white transition-colors hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500"
            title="Enviar mensaje"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
