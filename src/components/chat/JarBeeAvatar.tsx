"use client";

import React from "react";
import { useJarBeeEngine, AvatarMood } from "./useJarBeeEngine";

interface JarBeeAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  isListening?: boolean;
  isThinking?: boolean;
  isSpeaking?: boolean;
  moodOverride?: AvatarMood;
  interactive?: boolean;
  showStatusGlow?: boolean;
}

const SIZE_MAP = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-20 w-20",
  xl: "h-28 w-28",
};

export function JarBeeAvatar({
  size = "md",
  className = "",
  isListening = false,
  isThinking = false,
  isSpeaking = false,
  moodOverride,
  interactive = true,
  showStatusGlow = true,
}: JarBeeAvatarProps) {
  const {
    mood,
    isBlinking,
    isSleeping,
    gazeX,
    gazeY,
    mouthOpenness,
    antennaPulse,
    wingSpeed,
    triggerHappyReaction,
  } = useJarBeeEngine({
    isListening,
    isThinking,
    isSpeaking,
    moodOverride,
  });

  // Calculate eye pupil displacements
  const pupilOffsetX = gazeX * 3.5;
  const pupilOffsetY = gazeY * 2.8;

  // Wing flapping animation speed classes
  const wingClassLeft =
    wingSpeed === "fast"
      ? "animate-wing-fast-left"
      : wingSpeed === "normal"
      ? "animate-wing-normal-left"
      : wingSpeed === "slow"
      ? "animate-wing-slow-left"
      : "";

  const wingClassRight =
    wingSpeed === "fast"
      ? "animate-wing-fast-right"
      : wingSpeed === "normal"
      ? "animate-wing-normal-right"
      : wingSpeed === "slow"
      ? "animate-wing-slow-right"
      : "";

  // Body hover levitation class
  const bodyHoverClass = isSleeping ? "" : "animate-jarbee-float";

  return (
    <div
      onClick={interactive ? triggerHappyReaction : undefined}
      className={`relative inline-flex items-center justify-center select-none ${SIZE_MAP[size]} ${className} ${
        interactive ? "cursor-pointer active:scale-95 transition-transform" : ""
      }`}
      title={
        isSleeping
          ? "JarBee en reposo (hacé click o mové el mouse para despertar)"
          : isListening
          ? "JarBee está escuchando..."
          : isThinking
          ? "JarBee está procesando..."
          : isSpeaking
          ? "JarBee está hablando"
          : "JarBee asistente (click para saludar)"
      }
    >
      {/* Background Status Glow */}
      {showStatusGlow && (
        <div
          className={`absolute inset-0 rounded-full transition-all duration-500 pointer-events-none ${
            isListening
              ? "bg-[#0078d7]/35 blur-md scale-125 animate-pulse"
              : isThinking
              ? "bg-[#429ce3]/25 blur-md scale-115"
              : isSpeaking
              ? "bg-[#0078d7]/20 blur-sm scale-110"
              : isSleeping
              ? "bg-transparent"
              : "bg-[#0078d7]/10 blur-xs scale-105"
          }`}
        />
      )}

      {/* SVG Vector Robot Bee Drone */}
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full drop-shadow-md transition-transform duration-300 ${bodyHoverClass}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Cyber Body Gradient */}
          <linearGradient id="jarbee-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2c2c2c" />
            <stop offset="60%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#101010" />
          </linearGradient>

          {/* Visor Screen Gradient */}
          <linearGradient id="jarbee-visor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#080808" />
            <stop offset="100%" stopColor="#141414" />
          </linearGradient>

          {/* Acrylic Glass Wing Gradient */}
          <linearGradient id="jarbee-wing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.45)" />
            <stop offset="50%" stopColor="rgba(66, 156, 227, 0.25)" />
            <stop offset="100%" stopColor="rgba(0, 120, 215, 0.15)" />
          </linearGradient>

          {/* Glow filter for digital eyes */}
          <filter id="eye-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Radar wave pulse filter */}
          <filter id="pulse-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* ─── 1. WINGS (Back layer) ─────────────────────────────────── */}
        <g className="jarbee-wings">
          {/* Left Wing */}
          <path
            d="M 42 38 C 22 18, 8 28, 14 44 C 20 54, 38 46, 42 38 Z"
            fill="url(#jarbee-wing)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.8"
            className={`origin-[42px_38px] ${wingClassLeft}`}
          />

          {/* Right Wing */}
          <path
            d="M 58 38 C 78 18, 92 28, 86 44 C 80 54, 62 46, 58 38 Z"
            fill="url(#jarbee-wing)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.8"
            className={`origin-[58px_38px] ${wingClassRight}`}
          />
        </g>

        {/* ─── 2. ANTENNAS & RADAR SENSORS ────────────────────────────── */}
        <g className="jarbee-antennas">
          {/* Left Antenna Stem */}
          <path
            d="M 38 28 Q 30 18 26 14"
            fill="none"
            stroke="#404040"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Left Sensor Tip */}
          <circle
            cx="26"
            cy="14"
            r={antennaPulse ? "4" : "3"}
            fill={antennaPulse ? "#429ce3" : "#0078d7"}
            filter="url(#eye-glow)"
          />

          {/* Right Antenna Stem */}
          <path
            d="M 62 28 Q 70 18 74 14"
            fill="none"
            stroke="#404040"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Right Sensor Tip */}
          <circle
            cx="74"
            cy="14"
            r={antennaPulse ? "4" : "3"}
            fill={antennaPulse ? "#429ce3" : "#0078d7"}
            filter="url(#eye-glow)"
          />

          {/* Radar Sound Waves (When Listening) */}
          {antennaPulse && (
            <g className="animate-ping origin-[50px_14px]">
              <circle cx="26" cy="14" r="7" fill="none" stroke="#429ce3" strokeWidth="0.8" opacity="0.6" />
              <circle cx="74" cy="14" r="7" fill="none" stroke="#429ce3" strokeWidth="0.8" opacity="0.6" />
            </g>
          )}
        </g>

        {/* ─── 3. DRONE CHASSIS BODY ─────────────────────────────────── */}
        <g className="jarbee-body">
          {/* Main Sphere Capsule */}
          <rect
            x="24"
            y="24"
            width="52"
            height="58"
            rx="26"
            fill="url(#jarbee-body)"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.2"
          />

          {/* Cyber Stripes / Abdomen Bee Bands */}
          <path
            d="M 28 66 Q 50 72 72 66"
            fill="none"
            stroke="rgba(0, 120, 215, 0.4)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 32 73 Q 50 78 68 73"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Stinger Mini Thruster */}
          <polygon
            points="46,82 54,82 50,88"
            fill="#222222"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="0.8"
          />
          {/* Thruster Glow */}
          <circle
            cx="50"
            cy="85"
            r={wingSpeed === "fast" ? "3.2" : "1.8"}
            fill="#0078d7"
            opacity={isSleeping ? "0" : "0.75"}
            filter="url(#eye-glow)"
          />
        </g>

        {/* ─── 4. OLED VISOR SCREEN ───────────────────────────────────── */}
        <rect
          x="30"
          y="34"
          width="40"
          height="26"
          rx="13"
          fill="url(#jarbee-visor)"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="0.8"
        />

        {/* ─── 5. EXPRESSIVE DIGITAL EYES ─────────────────────────────── */}
        <g className="jarbee-eyes" filter="url(#eye-glow)">
          {isBlinking ? (
            /* Blinking state: closed thin digital lines */
            <g stroke="#429ce3" strokeWidth="2.2" strokeLinecap="round">
              <line x1="36" y1="46" x2="44" y2="46" />
              <line x1="56" y1="46" x2="64" y2="46" />
            </g>
          ) : isSleeping || mood === "sleepy" ? (
            /* Sleepy state: peaceful curved lines + floating Z */
            <g>
              <path
                d="M 36 47 Q 40 49 44 47"
                fill="none"
                stroke="#0078d7"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M 56 47 Q 60 49 64 47"
                fill="none"
                stroke="#0078d7"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* Animated Floating Zzz */}
              <text
                x="68"
                y="32"
                fill="#429ce3"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                className="animate-pulse"
                opacity="0.85"
              >
                z
              </text>
            </g>
          ) : mood === "happy" ? (
            /* Happy state: joyful arch curves ^ ^ */
            <g stroke="#429ce3" strokeWidth="2.8" strokeLinecap="round" fill="none">
              <path d="M 35 48 Q 40 40 45 48" />
              <path d="M 55 48 Q 60 40 65 48" />
            </g>
          ) : mood === "thinking" ? (
            /* Thinking state: glances upwards / sideways */
            <g fill="#429ce3">
              <circle cx="41" cy="42" r="4.2" />
              <circle cx="61" cy="42" r="3.6" />
              {/* Highlight specular dots */}
              <circle cx="42" cy="40.5" r="1.2" fill="#ffffff" />
              <circle cx="62" cy="40.5" r="1" fill="#ffffff" />
            </g>
          ) : (
            /* Normal / Focused / Gaze following cursor */
            <g fill="#0078d7">
              {/* Left Eye */}
              <circle cx={40 + pupilOffsetX} cy={46 + pupilOffsetY} r="4.2" fill="#429ce3" />
              <circle cx={40 + pupilOffsetX + 1.2} cy={46 + pupilOffsetY - 1.2} r="1.5" fill="#ffffff" />

              {/* Right Eye */}
              <circle cx={60 + pupilOffsetX} cy={46 + pupilOffsetY} r="4.2" fill="#429ce3" />
              <circle cx={60 + pupilOffsetX + 1.2} cy={46 + pupilOffsetY - 1.2} r="1.5" fill="#ffffff" />
            </g>
          )}
        </g>

        {/* ─── 6. DIGITAL MOUTH / SPEECH MODULATOR ─────────────────────── */}
        {isSpeaking && mouthOpenness > 0.1 ? (
          <ellipse
            cx="50"
            cy="54"
            rx="4.5"
            ry={Math.max(1, mouthOpenness * 3.5)}
            fill="#429ce3"
            filter="url(#eye-glow)"
          />
        ) : mood === "happy" ? (
          <path
            d="M 47 53 Q 50 56 53 53"
            fill="none"
            stroke="#429ce3"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        ) : null}
      </svg>
    </div>
  );
}
