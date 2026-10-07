"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Info } from "lucide-react";
import { Discipline } from "@/app/services/preguntas.api";

interface DisciplineSelectorProps {
  disciplines: Discipline[];
  selectedMode: string;
  onSelectMode: (discipline: Discipline) => void;
  isLoading?: boolean;
}

const DISCIPLINE_COLORS: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  auto: {
    bg: "from-cyan-500/15 via-blue-500/10 to-indigo-500/15",
    border: "border-cyan-500/50",
    glow: "shadow-cyan-500/20",
    text: "text-cyan-400",
  },
  chatbot: {
    bg: "from-sky-500/15 via-blue-500/10 to-cyan-500/15",
    border: "border-sky-500/50",
    glow: "shadow-sky-500/20",
    text: "text-sky-400",
  },
  coder: {
    bg: "from-emerald-500/15 via-teal-500/10 to-cyan-500/15",
    border: "border-emerald-500/50",
    glow: "shadow-emerald-500/20",
    text: "text-emerald-400",
  },
  traductor: {
    bg: "from-violet-500/15 via-purple-500/10 to-fuchsia-500/15",
    border: "border-violet-500/50",
    glow: "shadow-violet-500/20",
    text: "text-violet-400",
  },
  reader: {
    bg: "from-amber-500/15 via-orange-500/10 to-yellow-500/15",
    border: "border-amber-500/50",
    glow: "shadow-amber-500/20",
    text: "text-amber-400",
  },
  ocr: {
    bg: "from-blue-500/15 via-indigo-500/10 to-slate-500/15",
    border: "border-blue-500/50",
    glow: "shadow-blue-500/20",
    text: "text-blue-400",
  },
  video: {
    bg: "from-pink-500/15 via-rose-500/10 to-red-500/15",
    border: "border-pink-500/50",
    glow: "shadow-pink-500/20",
    text: "text-pink-400",
  },
  rag: {
    bg: "from-teal-500/15 via-cyan-500/10 to-blue-500/15",
    border: "border-teal-500/50",
    glow: "shadow-teal-500/20",
    text: "text-teal-400",
  },
  planner: {
    bg: "from-purple-500/15 via-indigo-500/10 to-blue-500/15",
    border: "border-purple-500/50",
    glow: "shadow-purple-500/20",
    text: "text-purple-400",
  },
  tools: {
    bg: "from-orange-500/15 via-amber-500/10 to-yellow-500/15",
    border: "border-orange-500/50",
    glow: "shadow-orange-500/20",
    text: "text-orange-400",
  },
};

export function DisciplineSelector({
  disciplines,
  selectedMode,
  onSelectMode,
  isLoading = false,
}: DisciplineSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeInfo, setActiveInfo] = useState<Discipline | null>(null);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [disciplines]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (el) {
      const scrollAmount = direction === "left" ? -240 : 240;
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  const currentDiscipline = disciplines.find((d) => d.id === selectedMode) || disciplines[0];
  const colorScheme = DISCIPLINE_COLORS[selectedMode] || DISCIPLINE_COLORS.auto;

  return (
    <div className="w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-3 py-2 sm:px-4">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Bar */}
        <div className="relative flex items-center">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute -left-2 z-10 hidden sm:flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 text-slate-300 shadow-lg backdrop-blur-sm transition hover:bg-slate-800 hover:text-white"
              aria-label="Desplazar a la izquierda"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Pills Carousel Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="no-scrollbar flex w-full items-center gap-2 overflow-x-auto py-1 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {disciplines.map((d, index) => {
              const isSelected = d.id === selectedMode;
              const pillColor = DISCIPLINE_COLORS[d.id] || DISCIPLINE_COLORS.auto;

              return (
                <button
                  key={`discipline-${d.id}-${index}`}
                  onClick={() => onSelectMode(d)}
                  disabled={isLoading}
                  title={`${d.name}: ${d.description}`}
                  className={`group relative flex items-center gap-2 shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                    isSelected
                      ? `bg-gradient-to-r ${pillColor.bg} ${pillColor.border} ${pillColor.glow} border text-slate-100 shadow-md ring-1 ring-white/10`
                      : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:bg-slate-800/80 hover:text-slate-200"
                  }`}
                >
                  {/* Icon */}
                  <span className="text-sm select-none transition-transform group-hover:scale-110">
                    {d.icon}
                  </span>

                  {/* Name */}
                  <span className={`tracking-wide ${isSelected ? "font-semibold text-slate-100" : "text-slate-300"}`}>
                    {d.name}
                  </span>

                  {/* Model tag if active or on hover */}
                  {isSelected && d.model && (
                    <span className="hidden sm:inline-block rounded-md bg-slate-950/60 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 border border-slate-800">
                      {d.model.split(":")[0].replace("RogerBen/", "").replace("sematre/", "").replace("yemifo/", "")}
                    </span>
                  )}

                  {/* Active glowing dot */}
                  {isSelected && (
                    <span className="relative flex h-1.5 w-1.5 ml-0.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute -right-2 z-10 hidden sm:flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 text-slate-300 shadow-lg backdrop-blur-sm transition hover:bg-slate-800 hover:text-white"
              aria-label="Desplazar a la derecha"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Active Specialist Micro-Banner */}
        {currentDiscipline && (
          <div className="mt-1.5 flex items-center justify-between gap-2 px-1 text-[11px] text-slate-400 animate-fade-in">
            <div className="flex items-center gap-1.5 truncate">
              <span className={`font-semibold ${colorScheme.text}`}>
                {currentDiscipline.icon} {currentDiscipline.name}:
              </span>
              <span className="truncate text-slate-400">
                {currentDiscipline.description}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {currentDiscipline.model && (
                <span className="hidden md:flex items-center gap-1 rounded bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800">
                  <Sparkles className="h-2.5 w-2.5 text-cyan-400" />
                  {currentDiscipline.model}
                </span>
              )}
              <button
                type="button"
                onClick={() => setActiveInfo(activeInfo ? null : currentDiscipline)}
                className="text-slate-500 hover:text-slate-300 transition"
                title="Información del especialista"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Info Modal / Drawer popup */}
        {activeInfo && (
          <div className="mt-2 rounded-xl border border-cyan-500/20 bg-slate-900/90 p-3 shadow-xl backdrop-blur-md animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base">{activeInfo.icon}</span>
                  <h4 className="font-semibold text-slate-100 text-xs">{activeInfo.name}</h4>
                  {activeInfo.category && (
                    <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-400 border border-cyan-500/20">
                      {activeInfo.category}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">{activeInfo.description}</p>
                {activeInfo.suggestedPrompt && (
                  <div className="mt-2 rounded-lg bg-slate-950/60 p-2 border border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold block mb-0.5">Prompt Sugerido:</span>
                    <p className="text-xs text-slate-300 italic font-mono">&ldquo;{activeInfo.suggestedPrompt}&rdquo;</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setActiveInfo(null)}
                className="text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
