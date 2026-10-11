"use client";
import { useRef, useState } from "react";
import { Send, Plus, Mic, Image as ImageIcon, FileText, X, BookOpen, Music, Check } from "lucide-react";
import { useVoiceRecorder } from "./useVoiceRecorder";

export type AttachedFile = {
  file: File;
  type: "image" | "pdf" | "audio";
  previewUrl?: string; // para imágenes
};

interface ChatInputSimpleProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onVoiceToggle?: () => void;
  isListening?: boolean;
  isTyping: boolean;
  maxLength: number;
  errorMessage?: string;
  placeholder?: string;
  suggestedPrompt?: string;
  // archivo adjunto
  attachedFile?: AttachedFile | null;
  onFileAttach?: (file: AttachedFile | null) => void;
  // Sugerencias para autocompletado (títulos y autores)
  suggestions?: { titulo: string; autor?: string }[];
  // Grabación nativa de audio MediaRecorder (Opus/WebM)
  onVoiceRecorded?: (audioBlob: Blob, durationSeconds: number) => void;
}

const BUILT_IN_COMMANDS = [
  {
    titulo: "/balance",
    autor: "Cuestionario de balance energético (10 preguntas interactivas)",
    iconType: "command" as const,
  },
  {
    titulo: "/audio",
    autor: "Analizar sample de audio (BPM, tono, tempo, limpieza de voz)",
    iconType: "audio" as const,
  },
  {
    titulo: "/podcast",
    autor: "Generar síntesis hablada en MP3 para escuchar",
    iconType: "audio" as const,
  },
];

export function ChatInputSimple({
  value,
  onChange,
  onSubmit,
  onVoiceToggle,
  isListening = false,
  isTyping,
  maxLength,
  errorMessage,
  placeholder,
  suggestedPrompt,
  attachedFile,
  onFileAttach,
  suggestions = [],
  onVoiceRecorded,
}: ChatInputSimpleProps) {
  const [showTools, setShowTools] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [dropdownOpen, setDropdownOpen] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Hook nativo de grabación Opus/WebM
  const voiceRecorder = useVoiceRecorder();

  // Detect context for autocomplete: slash '/' preceded by space or start of string
  const lastSlashIndex = value.lastIndexOf("/");
  const isSlashTriggered = lastSlashIndex !== -1 && (lastSlashIndex === 0 || /\s/.test(value[lastSlashIndex - 1]));
  const searchQuery = isSlashTriggered ? value.substring(lastSlashIndex + 1).toLowerCase() : "";

  const combinedSuggestions = [
    ...BUILT_IN_COMMANDS,
    ...suggestions.map((s) => ({ ...s, iconType: "book" as const })),
  ];

  const filteredSuggestions = isSlashTriggered
    ? combinedSuggestions.filter((item) => {
        const search = searchQuery.toLowerCase();
        return (
          item.titulo.toLowerCase().includes(search) ||
          (item.autor && item.autor.toLowerCase().includes(search))
        );
      })
    : [];

  const showDropdown = isSlashTriggered && dropdownOpen && filteredSuggestions.length > 0;

  const selectSuggestion = (suggestion: string) => {
    if (lastSlashIndex !== -1) {
      const beforeSlash = value.substring(0, lastSlashIndex);
      const newValue = `${beforeSlash}${suggestion} `;
      onChange(newValue);
    }
    setDropdownOpen(false);
    setHighlightedIndex(0);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const lastSlash = val.lastIndexOf("/");
    const isNowTriggered = lastSlash !== -1 && (lastSlash === 0 || /\s/.test(val[lastSlash - 1]));
    if (isNowTriggered) {
      setDropdownOpen(true);
    }
    onChange(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showDropdown) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredSuggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        selectSuggestion(filteredSuggestions[highlightedIndex].titulo);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setDropdownOpen(false);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onFileAttach) return;
    const previewUrl = URL.createObjectURL(file);
    onFileAttach({ file, type: "image", previewUrl });
    setShowTools(false);
    e.target.value = "";
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onFileAttach) return;
    onFileAttach({ file, type: "pdf" });
    setShowTools(false);
    e.target.value = "";
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onFileAttach) return;
    onFileAttach({ file, type: "audio" });
    setShowTools(false);
    e.target.value = "";
  };

  // Manejo de micrófono (prioriza MediaRecorder nativo si existe onVoiceRecorded)
  const handleMicClick = async () => {
    if (onVoiceRecorded) {
      if (voiceRecorder.isRecording) {
        const result = await voiceRecorder.stopRecording();
        if (result && result.blob) {
          onVoiceRecorded(result.blob, result.duration);
        }
      } else {
        await voiceRecorder.startRecording();
      }
    } else if (onVoiceToggle) {
      onVoiceToggle();
    }
  };

  const handleCancelVoice = () => {
    voiceRecorder.cancelRecording();
  };

  const handleFinishVoice = async () => {
    if (!onVoiceRecorded) return;
    const result = await voiceRecorder.stopRecording();
    if (result && result.blob) {
      onVoiceRecorded(result.blob, result.duration);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const canSend = (value.trim() || attachedFile) && !isTyping && !voiceRecorder.isRecording;

  return (
    <div className="border-t border-white/[0.08] bg-[#101010]/95 backdrop-blur-2xl px-4 py-3 select-none">
      <div className="mx-auto max-w-3xl">

        {/* Tools menu */}
        {showTools && (
          <div className="mb-3 flex flex-wrap gap-2 rounded-xl border border-white/[0.10] bg-[#1a1a1a] p-2.5 shadow-xl">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#222222] px-3 py-2 text-sm text-[#d4d4d4] transition hover:border-[#0078d7] hover:bg-[#2c2c2c] hover:text-white"
            >
              <ImageIcon className="h-4 w-4 text-[#429ce3]" />
              Imagen
            </button>
            <button
              onClick={() => pdfInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#222222] px-3 py-2 text-sm text-[#d4d4d4] transition hover:border-[#0078d7] hover:bg-[#2c2c2c] hover:text-white"
            >
              <FileText className="h-4 w-4 text-[#429ce3]" />
              PDF
            </button>
            <button
              onClick={() => audioInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#222222] px-3 py-2 text-sm text-[#d4d4d4] transition hover:border-purple-500 hover:bg-[#2c2c2c] hover:text-white"
            >
              <Music className="h-4 w-4 text-purple-400" />
              Audio / Sample
            </button>
          </div>
        )}

        {/* File preview */}
        {attachedFile && (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-white/[0.10] bg-[#1c1c1c] px-3 py-2">
            {attachedFile.type === "image" && attachedFile.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={attachedFile.previewUrl} alt="preview" className="h-10 w-10 rounded-lg object-cover" />
            ) : attachedFile.type === "audio" ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-950/40 border border-purple-500/30">
                <Music className="h-5 w-5 text-purple-400" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-950/40 border border-cyan-500/30">
                <FileText className="h-5 w-5 text-[#429ce3]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="block truncate text-xs font-medium text-[#d4d4d4]">{attachedFile.file.name}</span>
              <span className="block text-[10px] text-[#8e8e8e]">
                {attachedFile.type === "audio"
                  ? `Pista de audio (${(attachedFile.file.size / (1024 * 1024)).toFixed(2)} MB)`
                  : attachedFile.type === "pdf"
                  ? `Documento PDF (${(attachedFile.file.size / (1024 * 1024)).toFixed(2)} MB)`
                  : "Imagen adjunta"}
              </span>
            </div>
            <button
              onClick={() => onFileAttach?.(null)}
              className="rounded-full p-1.5 text-[#737373] hover:text-red-400 hover:bg-white/[0.05] transition"
              title="Quitar archivo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Quick Suggested Prompt Pill */}
        {suggestedPrompt && !value && !attachedFile && !voiceRecorder.isRecording && (
          <div className="mb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] uppercase font-semibold text-[#737373] shrink-0">Sugerencia:</span>
            <button
              type="button"
              onClick={() => {
                onChange(suggestedPrompt);
                setTimeout(() => textareaRef.current?.focus(), 0);
              }}
              className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#181818] px-3 py-1 text-xs text-[#d4d4d4] transition hover:border-[#0078d7] hover:bg-[#242424] hover:text-white max-w-full truncate shadow-sm"
              title="Click para usar esta sugerencia"
            >
              <span className="truncate text-[11px] text-[#cccccc]">&ldquo;{suggestedPrompt}&rdquo;</span>
              <span className="text-[10px] text-[#429ce3] group-hover:text-white font-medium">usar ↵</span>
            </button>
          </div>
        )}

        {/* Voice recording error banner */}
        {voiceRecorder.error && (
          <div className="mb-2 flex items-center justify-between rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-1.5 text-xs text-red-300">
            <span>{voiceRecorder.error}</span>
            <button onClick={voiceRecorder.cancelRecording} className="text-red-400 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Input bar */}
        <div className="flex items-end gap-2">
          {/* Plus button */}
          {!voiceRecorder.isRecording && (
            <button
              onClick={() => setShowTools(!showTools)}
              className={`flex-shrink-0 rounded-full p-2.5 transition ${
                showTools
                  ? "bg-[#0078d7]/20 text-[#429ce3]"
                  : "text-[#9e9e9e] hover:bg-[#222222] hover:text-white"
              }`}
              title="Adjuntar archivo o audio"
            >
              <Plus className={`h-5 w-5 transition-transform ${showTools ? "rotate-45" : ""}`} />
            </button>
          )}

          {/* Conditional: Voice Recording Active vs Standard Textarea */}
          {voiceRecorder.isRecording ? (
            <div className="flex flex-1 items-center justify-between rounded-xl border border-red-500/30 bg-red-950/20 px-3.5 py-2 text-sm shadow-inner animate-pulse-subtle">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                </span>
                <span className="font-mono text-xs font-semibold text-red-300">
                  {formatSeconds(voiceRecorder.recordingDuration)}
                </span>
                {/* Visualizador de ondas sonoras en tiempo real */}
                <div className="flex items-center gap-1 h-5 px-1">
                  {voiceRecorder.audioLevels.map((lvl, idx) => (
                    <span
                      key={`wave-bar-${idx}`}
                      className="w-1 rounded-full bg-red-400 transition-all duration-75"
                      style={{
                        height: `${Math.max(4, Math.min(20, Math.round(lvl * 20)))}px`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-zinc-400 hidden sm:inline">Grabando voz para JarBees...</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCancelVoice}
                  className="rounded-lg p-1.5 text-zinc-400 hover:text-red-400 hover:bg-white/[0.06] transition"
                  title="Descartar grabación"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleFinishVoice}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500 transition shadow-sm"
                  title="Finalizar y enviar audio"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  attachedFile
                    ? attachedFile.type === "audio"
                      ? "¿Qué deseas analizar o procesar de este audio?..."
                      : "Agregá una pregunta (opcional)..."
                    : placeholder || "Escribe un mensaje o presiona el micrófono..."
                }
                disabled={isTyping}
                rows={1}
                maxLength={maxLength}
                className="w-full resize-none rounded-xl border border-white/[0.10] bg-[#181818] px-4 py-2.5 pr-12 text-sm text-white placeholder-[#737373] focus:border-[#0078d7] focus:outline-none focus:ring-1 focus:ring-[#0078d7] disabled:opacity-50 transition"
                style={{ maxHeight: "200px", minHeight: "42px" }}
              />

              {showDropdown && (
                <div className="absolute bottom-full left-0 z-50 mb-2 w-full max-h-60 overflow-y-auto rounded-xl border border-white/[0.10] bg-[#181818] shadow-2xl p-1">
                  {filteredSuggestions.slice(0, 8).map((suggestion, idx) => (
                    <button
                      key={`suggestion-${suggestion.titulo}-${idx}`}
                      type="button"
                      onClick={() => selectSuggestion(suggestion.titulo)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                        idx === highlightedIndex
                          ? "bg-[#0078d7]/20 text-white"
                          : "text-[#d4d4d4] hover:bg-[#252525]"
                      }`}
                    >
                      {suggestion.iconType === "audio" ? (
                        <Music className="h-4 w-4 flex-shrink-0 text-purple-400" />
                      ) : suggestion.iconType === "command" ? (
                        <span className="text-sm">⚡</span>
                      ) : (
                        <BookOpen className="h-4 w-4 flex-shrink-0 text-[#0078d7]" />
                      )}
                      <div className="flex flex-col text-left truncate flex-1">
                        <span className="truncate font-medium text-white">{suggestion.titulo}</span>
                        {suggestion.autor && (
                          <span className="truncate text-[11px] text-[#9e9e9e] mt-0.5">{suggestion.autor}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {errorMessage && (
            <p className="mt-2 text-xs text-red-400">{errorMessage}</p>
          )}

          {/* Voice button (solo si no estamos en barra de grabación) */}
          {!voiceRecorder.isRecording && (
            <button
              onClick={handleMicClick}
              disabled={isTyping}
              className={`flex-shrink-0 rounded-full p-2.5 transition ${
                isListening
                  ? "animate-pulse bg-red-500/20 text-red-400"
                  : "text-[#9e9e9e] hover:bg-[#222222] hover:text-white disabled:opacity-50"
              }`}
              title={isListening ? "Detener dictado" : "Hablar con JarBees (Micrófono)"}
            >
              <Mic className="h-5 w-5" />
            </button>
          )}

          {/* Send button */}
          {!voiceRecorder.isRecording && (
            <button
              onClick={onSubmit}
              disabled={!canSend}
              className="flex-shrink-0 rounded-full bg-[#0078d7] p-2.5 text-white transition hover:bg-[#106ebe] disabled:opacity-40 disabled:hover:bg-[#0078d7] shadow-sm"
              title="Enviar mensaje"
            >
              <Send className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleImageSelect}
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handlePdfSelect}
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.flac,.aiff,.m4a"
          className="hidden"
          onChange={handleAudioSelect}
        />
      </div>
    </div>
  );
}
