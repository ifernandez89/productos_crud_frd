"use client";
import React, { useState } from "react";
import { Clock, AlertTriangle, Copy, Check, Volume2, VolumeX } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { JarBeeAvatar } from "./JarBeeAvatar";

interface ChatMessageCompactProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  responseTime?: number;
  isError?: boolean;
  mode?: string;
  onSpeak?: (text: string) => void;
  isSpeakingThis?: boolean;
}

export function ChatMessageCompact({
  role,
  content,
  responseTime,
  isError,
  mode,
  onSpeak,
  isSpeakingThis = false,
}: ChatMessageCompactProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";
  const isSystem = role === "system";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Mensaje de error del sistema
  if (isSystem || isError) {
    return (
      <div className="py-2.5">
        <div className="mx-auto flex w-full max-w-3xl px-4">
          <div className="flex w-full items-start gap-3 rounded-xl border border-amber-500/25 bg-[#181818] px-4 py-3 shadow-lg">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
            <p className="text-sm text-amber-200 leading-relaxed">{content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative flex gap-3 py-3.5 transition-colors ${
        isUser ? "" : "bg-[#141414]/80 border-y border-white/[0.04]"
      }`}
    >
      <div className="mx-auto flex w-full max-w-3xl gap-3.5 px-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0078d7] text-xs font-semibold text-white shadow-sm select-none">
              Tú
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1c1c1c] border border-white/[0.10] shadow-sm">
              <JarBeeAvatar size="sm" interactive={false} showStatusGlow={false} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header info */}
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-white">
                {isUser ? "Tú" : "JarBees"}
              </span>
              {!isUser && mode && (
                <span className="rounded bg-[#0078d7]/15 border border-[#0078d7]/30 px-1.5 py-0.2 text-[10px] font-mono text-[#429ce3] uppercase tracking-wider">
                  {mode}
                </span>
              )}
            </div>

            {/* Quick actions on hover: Escuchar & Copiar */}
            {!isUser && content && (
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                {onSpeak && (
                  <button
                    onClick={() => onSpeak(content)}
                    className="flex items-center gap-1 rounded bg-[#1f1f1f] border border-white/[0.08] px-2 py-0.5 text-[11px] text-[#9e9e9e] hover:bg-[#282828] hover:text-white"
                    title={isSpeakingThis ? "Detener lectura de voz" : "Escuchar respuesta (Voz)"}
                  >
                    {isSpeakingThis ? (
                      <>
                        <VolumeX className="h-3 w-3 text-red-400" />
                        <span className="text-red-400 font-medium">Detener</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3 w-3 text-cyan-400" />
                        <span>Escuchar</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded bg-[#1f1f1f] border border-white/[0.08] px-2 py-0.5 text-[11px] text-[#9e9e9e] hover:bg-[#282828] hover:text-white"
                  title="Copiar texto"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Message Body */}
          {isUser ? (
            <div className="text-sm leading-relaxed text-[#f3f3f3] whitespace-pre-wrap">
              {content}
            </div>
          ) : (
            <MarkdownRenderer content={content} />
          )}

          {!isUser && responseTime && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#737373]">
              <Clock className="h-3 w-3 text-[#737373]" />
              <span>{(responseTime / 1000).toFixed(2)}s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
