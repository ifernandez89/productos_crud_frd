"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple, robust markdown block parser for AI messages
  const renderBlocks = (text: string) => {
    // Split by code blocks
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Text before code block
      if (match.index > lastIndex) {
        const textChunk = text.substring(lastIndex, match.index);
        parts.push(
          <div key={`text-${lastIndex}`} className="space-y-2">
            {renderFormattedText(textChunk)}
          </div>
        );
      }

      const language = match[1] || "code";
      const codeContent = match[2];
      const blockKey = `code-${match.index}`;

      parts.push(
        <CodeBlock key={blockKey} language={language} code={codeContent} />
      );

      lastIndex = match.index + match[0].length;
    }

    // Remaining text
    if (lastIndex < text.length) {
      const textChunk = text.substring(lastIndex);
      parts.push(
        <div key={`text-${lastIndex}`} className="space-y-2">
          {renderFormattedText(textChunk)}
        </div>
      );
    }

    return parts;
  };

  const renderFormattedText = (textChunk: string) => {
    const lines = textChunk.split("\n");
    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();

      if (!trimmed) {
        return <div key={`empty-${lineIdx}`} className="h-2" />;
      }

      // Headers
      if (trimmed.startsWith("### ")) {
        return (
          <h4 key={`h3-${lineIdx}`} className="font-semibold text-slate-100 text-sm mt-3 mb-1">
            {renderInlineMarkdown(trimmed.replace(/^### /, ""))}
          </h4>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h3 key={`h2-${lineIdx}`} className="font-bold text-slate-100 text-base mt-4 mb-1">
            {renderInlineMarkdown(trimmed.replace(/^## /, ""))}
          </h3>
        );
      }
      if (trimmed.startsWith("# ")) {
        return (
          <h2 key={`h1-${lineIdx}`} className="font-extrabold text-slate-100 text-lg mt-4 mb-2">
            {renderInlineMarkdown(trimmed.replace(/^# /, ""))}
          </h2>
        );
      }

      // Bullet points
      if (/^[-*•]\s+/.test(trimmed)) {
        const bulletText = trimmed.replace(/^[-*•]\s+/, "");
        return (
          <div key={`bullet-${lineIdx}`} className="flex items-start gap-2 ml-2 my-0.5">
            <span className="text-cyan-400 mt-1 text-xs select-none">•</span>
            <span className="text-sm leading-relaxed text-slate-200">
              {renderInlineMarkdown(bulletText)}
            </span>
          </div>
        );
      }

      // Numbered lists
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        return (
          <div key={`num-${lineIdx}`} className="flex items-start gap-2 ml-2 my-0.5">
            <span className="text-cyan-400 font-mono text-xs mt-0.5 shrink-0 select-none">
              {numMatch[1]}.
            </span>
            <span className="text-sm leading-relaxed text-slate-200">
              {renderInlineMarkdown(numMatch[2])}
            </span>
          </div>
        );
      }

      // Blockquotes
      if (trimmed.startsWith("> ")) {
        return (
          <blockquote
            key={`quote-${lineIdx}`}
            className="border-l-2 border-cyan-500/50 bg-cyan-950/20 px-3 py-1.5 my-1.5 rounded-r-lg text-xs italic text-slate-300"
          >
            {renderInlineMarkdown(trimmed.replace(/^>\s*/, ""))}
          </blockquote>
        );
      }

      // Standard paragraph line
      return (
        <p key={`p-${lineIdx}`} className="text-sm leading-relaxed text-slate-200">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (line: string): React.ReactNode => {
    // Parse inline code `code` and bold **bold**
    const parts: React.ReactNode[] = [];
    const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = inlineRegex.exec(line)) !== null) {
      if (match.index > lastIdx) {
        parts.push(line.substring(lastIdx, match.index));
      }

      const matchText = match[0];
      if (matchText.startsWith("`") && matchText.endsWith("`")) {
        // Inline code
        parts.push(
          <code
            key={`inline-code-${match.index}`}
            className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-xs text-cyan-300 border border-slate-700/60"
          >
            {matchText.slice(1, -1)}
          </code>
        );
      } else if (matchText.startsWith("**") && matchText.endsWith("**")) {
        // Bold
        parts.push(
          <strong key={`bold-${match.index}`} className="font-semibold text-slate-100">
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith("*") && matchText.endsWith("*")) {
        // Italic
        parts.push(
          <em key={`italic-${match.index}`} className="italic text-slate-200">
            {matchText.slice(1, -1)}
          </em>
        );
      }

      lastIdx = match.index + matchText.length;
    }

    if (lastIdx < line.length) {
      parts.push(line.substring(lastIdx));
    }

    return parts.length > 0 ? parts : line;
  };

  return <div className="space-y-3 font-normal">{renderBlocks(content)}</div>;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-lg">
      {/* Code Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-1.5 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
          <Terminal className="h-3.5 w-3.5 text-cyan-400" />
          <span className="uppercase tracking-wider">{language || "code"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-300 transition hover:bg-slate-700 hover:text-white"
          title="Copiar código al portapapeles"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 text-slate-400" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
