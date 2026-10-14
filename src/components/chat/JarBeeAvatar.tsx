"use client";

import React from "react";
import { useJarBeeEngine, AvatarMood } from "./useJarBeeEngine";
import { JarBeeCyberAvatar3D } from "./JarBeeCyberAvatar3D";

export interface JarBeeAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  isListening?: boolean;
  isThinking?: boolean;
  isSpeaking?: boolean;
  moodOverride?: AvatarMood;
  interactive?: boolean;
  showStatusGlow?: boolean;
  mode?: "auto" | "3d" | "2d";
}

const SIZE_MAP = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-20 w-20",
  xl: "h-32 w-32",
};

const PIXEL_MAP: Record<string, number> = {
  sm: 32,
  md: 40,
  lg: 80,
  xl: 128,
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
  mode = "auto",
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

  // Decide whether to use 3D or 2D vector badge
  // By default: prominent sizes (md, lg, xl) use the real 3D WebGL model.
  // "sm" (used in repeated chat bubble lists) uses 2D by default to conserve WebGL contexts,
  // but can be forced to 3D with mode="3d".
  const use3D = mode === "3d" || (mode === "auto" && size !== "sm");

  if (use3D) {
    return (
      <JarBeeCyberAvatar3D
        size={size}
        className={`${SIZE_MAP[size]} ${className}`}
        isListening={isListening}
        isThinking={isThinking}
        isSpeaking={isSpeaking}
        isSleeping={isSleeping}
        gazeX={gazeX}
        gazeY={gazeY}
        interactive={interactive}
        onClick={triggerHappyReaction}
        showStatusGlow={showStatusGlow}
        pixelDimension={PIXEL_MAP[size]}
      />
    );
  }

  // ─── HIGH-PRECISION CYBER DRON 2D VECTOR BADGE (Matches 3D Robot palette) ───
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
          : "JarBee Cyber Drone (click para saludar)"
      }
    >
      {/* Background Status Glow */}
      {showStatusGlow && (
        <div
          className={`absolute inset-0 rounded-full transition-all duration-500 pointer-events-none ${
            isListening
              ? "bg-[#0078d7]/35 blur-md scale-125 animate-pulse"
              : isThinking
              ? "bg-[#00f0ff]/25 blur-md scale-115 animate-pulse"
              : isSpeaking
              ? "bg-[#f59e0b]/20 blur-sm scale-110"
              : isSleeping
              ? "bg-transparent"
              : "bg-[#0078d7]/10 blur-xs scale-105"
          }`}
        />
      )}

      {/* Cyber Drone Vector Graphic */}
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full drop-shadow-md transition-transform duration-300 ${bodyHoverClass}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Cyber Gunmetal Armor Gradient */}
          <linearGradient id="cyber-chassis" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#24272e" />
            <stop offset="50%" stopColor="#16171b" />
            <stop offset="100%" stopColor="#0d0e11" />
          </linearGradient>

          {/* Industrial Amber Enamel Gradient */}
          <linearGradient id="cyber-amber" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f7a317" />
            <stop offset="50%" stopColor="#ffb703" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* HUD Optical Visor Gradient */}
          <linearGradient id="cyber-visor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#040d14" />
            <stop offset="100%" stopColor="#0a1a24" />
          </linearGradient>

          {/* Hex-Solar Wing Gradient with Cyan Energy Traces */}
          <linearGradient id="cyber-hex-wing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 240, 255, 0.45)" />
            <stop offset="50%" stopColor="rgba(56, 189, 248, 0.28)" />
            <stop offset="100%" stopColor="rgba(0, 120, 215, 0.15)" />
          </linearGradient>

          {/* Emissive glow filter */}
          <filter id="cyber-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. HEX-SOLAR WINGS (Cyan Photovoltaic Grid) */}
        <g className="jarbee-wings">
          {/* Left Wing */}
          <path
            d="M 42 36 C 20 16, 6 26, 12 44 C 18 54, 38 46, 42 36 Z"
            fill="url(#cyber-hex-wing)"
            stroke="#00f0ff"
            strokeWidth="0.9"
            className={`origin-[42px_36px] ${wingClassLeft}`}
          />
          {/* Right Wing */}
          <path
            d="M 58 36 C 80 16, 94 26, 88 44 C 82 54, 62 46, 58 36 Z"
            fill="url(#cyber-hex-wing)"
            stroke="#00f0ff"
            strokeWidth="0.9"
            className={`origin-[58px_36px] ${wingClassRight}`}
          />
        </g>

        {/* 2. SENSOR ANTENNAS */}
        <g className="jarbee-antennas">
          <path d="M 38 27 Q 30 16 25 12" fill="none" stroke="#52525b" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="25" cy="12" r={antennaPulse ? "4" : "3"} fill={antennaPulse ? "#00f0ff" : "#f7a317"} filter="url(#cyber-glow)" />

          <path d="M 62 27 Q 70 16 75 12" fill="none" stroke="#52525b" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="75" cy="12" r={antennaPulse ? "4" : "3"} fill={antennaPulse ? "#00f0ff" : "#f7a317"} filter="url(#cyber-glow)" />
        </g>

        {/* 3. ROBOTIC CHASSIS (Gunmetal Armor + Amber Plating) */}
        <g className="jarbee-chassis">
          {/* Outer Plating */}
          <rect
            x="24"
            y="24"
            width="52"
            height="58"
            rx="26"
            fill="url(#cyber-chassis)"
            stroke="rgba(255, 255, 255, 0.14)"
            strokeWidth="1.2"
          />

          {/* Industrial Amber Racing Stripes */}
          <path
            d="M 28 64 Q 50 70 72 64"
            fill="none"
            stroke="url(#cyber-amber)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M 32 72 Q 50 77 68 72"
            fill="none"
            stroke="url(#cyber-amber)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Thruster Jet Nozzle */}
          <polygon points="46,82 54,82 50,88" fill="#16171b" stroke="#f7a317" strokeWidth="0.8" />
          <circle
            cx="50"
            cy="85"
            r={wingSpeed === "fast" ? "3.2" : "1.8"}
            fill="#00f0ff"
            opacity={isSleeping ? "0" : "0.85"}
            filter="url(#cyber-glow)"
          />
        </g>

        {/* 4. OPTICAL HUD VISOR SCREEN */}
        <rect
          x="30"
          y="34"
          width="40"
          height="26"
          rx="13"
          fill="url(#cyber-visor)"
          stroke="#00f0ff"
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />

        {/* 5. DIGITAL HUD SCANLINE & EYES */}
        <g className="jarbee-eyes" filter="url(#cyber-glow)">
          {isBlinking ? (
            <g stroke="#00f0ff" strokeWidth="2.2" strokeLinecap="round">
              <line x1="36" y1="46" x2="44" y2="46" />
              <line x1="56" y1="46" x2="64" y2="46" />
            </g>
          ) : isSleeping || mood === "sleepy" ? (
            <g>
              <path d="M 36 47 Q 40 49 44 47" fill="none" stroke="#0078d7" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 56 47 Q 60 49 64 47" fill="none" stroke="#0078d7" strokeWidth="2.2" strokeLinecap="round" />
              <text x="68" y="32" fill="#00f0ff" fontSize="10" fontFamily="monospace" fontWeight="bold" className="animate-pulse" opacity="0.85">
                z
              </text>
            </g>
          ) : mood === "happy" ? (
            <g stroke="#00f0ff" strokeWidth="2.8" strokeLinecap="round" fill="none">
              <path d="M 35 48 Q 40 40 45 48" />
              <path d="M 55 48 Q 60 40 65 48" />
            </g>
          ) : mood === "thinking" ? (
            <g fill="#00f0ff">
              <circle cx="41" cy="42" r="4.2" />
              <circle cx="61" cy="42" r="3.6" />
              <circle cx="42" cy="40.5" r="1.2" fill="#ffffff" />
              <circle cx="62" cy="40.5" r="1" fill="#ffffff" />
            </g>
          ) : (
            <g fill="#00f0ff">
              <circle cx={40 + pupilOffsetX} cy={46 + pupilOffsetY} r="4.2" />
              <circle cx={40 + pupilOffsetX + 1.2} cy={46 + pupilOffsetY - 1.2} r="1.5" fill="#ffffff" />
              <circle cx={60 + pupilOffsetX} cy={46 + pupilOffsetY} r="4.2" />
              <circle cx={60 + pupilOffsetX + 1.2} cy={46 + pupilOffsetY - 1.2} r="1.5" fill="#ffffff" />
            </g>
          )}
        </g>

        {/* 6. SPEECH MODULATOR / HUD MOUTH */}
        {isSpeaking && mouthOpenness > 0.1 ? (
          <ellipse
            cx="50"
            cy="54"
            rx="4.5"
            ry={Math.max(1, mouthOpenness * 3.5)}
            fill="#00f0ff"
            filter="url(#cyber-glow)"
          />
        ) : mood === "happy" ? (
          <path d="M 47 53 Q 50 56 53 53" fill="none" stroke="#00f0ff" strokeWidth="1.6" strokeLinecap="round" />
        ) : null}
      </svg>
    </div>
  );
}
