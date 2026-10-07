"use client";
import React, { useState } from "react";
import { Clock, AlertTriangle, Copy, Check } from "lucide-react";
import Image from "next/image";
import { MarkdownRenderer } from "./MarkdownRenderer";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface ChatMessageCompactProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  responseTime?: number;
  isError?: boolean;
  mode?: string;
}

export function ChatMessageCompact({
  role,
  content,
  responseTime,
  isError,
  mode,
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
      <div className="py-3">
        <div className="mx-auto flex w-full max-w-3xl px-4">
          <div className="flex w-full items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 shadow-lg shadow-amber-500/5 backdrop-blur-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
            <p className="text-sm text-amber-200 leading-relaxed">{content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative flex gap-3 py-4 transition-colors ${
        isUser ? "" : "bg-slate-900/35 border-y border-slate-900/60"
      }`}
    >
      <div className="mx-auto flex w-full max-w-3xl gap-3 px-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white shadow-md shadow-cyan-500/20">
              Tú
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-600/15 p-1.5 border border-cyan-500/20 shadow-md shadow-cyan-500/10">
              <Image
                src={`${BASE_PATH}/JarBees_logo.png`}
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
          {/* Header info */}
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">
                {isUser ? "Tú" : "JarBees"}
              </span>
              {!isUser && mode && (
                <span className="rounded-md bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.2 text-[10px] font-mono text-cyan-400 uppercase">
                  {mode}
                </span>
              )}
            </div>

            {/* Quick copy on hover */}
            {!isUser && content && (
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                title="Copiar texto"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Message Body */}
          {isUser ? (
            <div className="text-sm leading-relaxed text-slate-100 whitespace-pre-wrap">
              {content}
            </div>
          ) : (
            <MarkdownRenderer content={content} />
          )}

          {!isUser && responseTime && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500">
              <Clock className="h-3 w-3 text-slate-500" />
              <span>{(responseTime / 1000).toFixed(2)}s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
