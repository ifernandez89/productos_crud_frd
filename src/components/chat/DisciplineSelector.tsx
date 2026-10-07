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

  return (
    <div className="w-full border-b border-white/[0.08] bg-[#101010]/90 backdrop-blur-2xl px-3 py-2 sm:px-4 select-none">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Bar */}
        <div className="relative flex items-center">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute -left-2 z-10 hidden sm:flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.12] bg-[#1c1c1c] text-[#9e9e9e] shadow-lg backdrop-blur-md transition hover:bg-[#282828] hover:text-white"
              aria-label="Desplazar a la izquierda"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Pills Carousel Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="no-scrollbar flex w-full items-center gap-1.5 overflow-x-auto py-1 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {disciplines.map((d, index) => {
              const isSelected = d.id === selectedMode;

              return (
                <button
                  key={`discipline-${d.id}-${index}`}
                  onClick={() => onSelectMode(d)}
                  disabled={isLoading}
                  title={`${d.name}: ${d.description}`}
                  className={`group relative flex items-center gap-2 shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ${
                    isSelected
                      ? "border border-[#0078d7] bg-[#0078d7]/20 text-white shadow-[0_0_12px_rgba(0,120,215,0.25)] ring-1 ring-[#0078d7]/40"
                      : "border border-white/[0.08] bg-[#1c1c1c]/90 text-[#9e9e9e] hover:border-white/[0.14] hover:bg-[#282828] hover:text-white"
                  }`}
                >
                  {/* Icon */}
                  <span className="text-sm select-none transition-transform group-hover:scale-105">
                    {d.icon}
                  </span>

                  {/* Name */}
                  <span className={`tracking-normal ${isSelected ? "font-semibold text-white" : "text-[#d4d4d4]"}`}>
                    {d.name}
                  </span>

                  {/* Model tag if active */}
                  {isSelected && d.model && (
                    <span className="hidden sm:inline-block rounded bg-[#101010]/80 px-1.5 py-0.5 text-[9px] font-mono text-[#9e9e9e] border border-white/[0.08]">
                      {d.model.split(":")[0].replace("RogerBen/", "").replace("sematre/", "").replace("yemifo/", "")}
                    </span>
                  )}

                  {/* Active glowing dot */}
                  {isSelected && (
                    <span className="relative flex h-1.5 w-1.5 ml-0.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#429ce3] opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0078d7]" />
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
              className="absolute -right-2 z-10 hidden sm:flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.12] bg-[#1c1c1c] text-[#9e9e9e] shadow-lg backdrop-blur-md transition hover:bg-[#282828] hover:text-white"
              aria-label="Desplazar a la derecha"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Active Specialist Micro-Banner */}
        {currentDiscipline && (
          <div className="mt-1.5 flex items-center justify-between gap-2 px-1 text-[11px] text-[#9e9e9e] animate-fade-in">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-semibold text-[#429ce3]">
                {currentDiscipline.icon} {currentDiscipline.name}:
              </span>
              <span className="truncate text-[#9e9e9e]">
                {currentDiscipline.description}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {currentDiscipline.model && (
                <span className="hidden md:flex items-center gap-1 rounded bg-[#181818] px-2 py-0.5 text-[10px] font-mono text-[#9e9e9e] border border-white/[0.08]">
                  <Sparkles className="h-2.5 w-2.5 text-[#429ce3]" />
                  {currentDiscipline.model}
                </span>
              )}
              <button
                type="button"
                onClick={() => setActiveInfo(activeInfo ? null : currentDiscipline)}
                className="text-[#737373] hover:text-white transition"
                title="Información del especialista"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Info Modal / Drawer popup */}
        {activeInfo && (
          <div className="mt-2 rounded-xl border border-white/[0.12] bg-[#181818]/95 p-3 shadow-2xl backdrop-blur-2xl animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base">{activeInfo.icon}</span>
                  <h4 className="font-semibold text-white text-xs">{activeInfo.name}</h4>
                  {activeInfo.category && (
                    <span className="rounded bg-[#0078d7]/15 px-2 py-0.5 text-[10px] text-[#429ce3] border border-[#0078d7]/30">
                      {activeInfo.category}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-[#d4d4d4] leading-relaxed">{activeInfo.description}</p>
                {activeInfo.suggestedPrompt && (
                  <div className="mt-2 rounded-lg bg-[#101010]/80 p-2.5 border border-white/[0.08]">
                    <span className="text-[10px] uppercase tracking-wider text-[#429ce3] font-semibold block mb-0.5">Prompt Sugerido:</span>
                    <p className="text-xs text-[#9e9e9e] font-mono">&ldquo;{activeInfo.suggestedPrompt}&rdquo;</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setActiveInfo(null)}
                className="text-xs text-[#9e9e9e] hover:text-white px-2 py-0.5 rounded bg-[#282828] transition"
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
