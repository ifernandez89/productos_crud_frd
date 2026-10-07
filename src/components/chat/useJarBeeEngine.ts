"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type AvatarMood = "neutral" | "happy" | "thinking" | "curious" | "sleepy" | "focused";
export type AvatarActivity = "idle" | "listening" | "thinking" | "speaking" | "sleep";

interface UseJarBeeEngineProps {
  isListening?: boolean;
  isThinking?: boolean;
  isSpeaking?: boolean;
  moodOverride?: AvatarMood;
}

export interface JarBeeEngineState {
  activity: AvatarActivity;
  mood: AvatarMood;
  isBlinking: boolean;
  isSleeping: boolean;
  gazeX: number; // -1 to 1
  gazeY: number; // -1 to 1
  mouthOpenness: number; // 0 to 1
  antennaPulse: boolean;
  wingSpeed: "off" | "slow" | "normal" | "fast";
  triggerHappyReaction: () => void;
}

const INACTIVITY_SLEEP_MS = 75000; // 75 seconds of no user activity to enter sleep

export function useJarBeeEngine({
  isListening = false,
  isThinking = false,
  isSpeaking = false,
  moodOverride,
}: UseJarBeeEngineProps): JarBeeEngineState {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [gazeX, setGazeX] = useState(0);
  const [gazeY, setGazeY] = useState(0);
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const [antennaPulse, setAntennaPulse] = useState(false);
  const [manualHappy, setManualHappy] = useState(false);

  const lastActivityTimeRef = useRef(Date.now());
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const glanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetGazeRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset inactivity timer
  const registerActivity = useCallback(() => {
    lastActivityTimeRef.current = Date.now();
    setIsSleeping((prev) => {
      if (prev) {
        // Waking up animation
        return false;
      }
      return false;
    });
  }, []);

  // Determine current active activity
  const currentActivity: AvatarActivity = isListening
    ? "listening"
    : isThinking
    ? "thinking"
    : isSpeaking
    ? "speaking"
    : isSleeping
    ? "sleep"
    : "idle";

  // Determine mood
  const currentMood: AvatarMood =
    moodOverride ||
    (manualHappy
      ? "happy"
      : isListening
      ? "focused"
      : isThinking
      ? "thinking"
      : isSpeaking
      ? "happy"
      : isSleeping
      ? "sleepy"
      : "neutral");

  // Determine wing speed
  const wingSpeed: "off" | "slow" | "normal" | "fast" = isSleeping
    ? "off"
    : isSpeaking || isListening
    ? "fast"
    : isThinking
    ? "normal"
    : "slow";

  // Trigger temporary happy celebration on click
  const triggerHappyReaction = useCallback(() => {
    registerActivity();
    setManualHappy(true);
    setTimeout(() => setManualHappy(false), 2400);
  }, [registerActivity]);

  // 1. Inactivity & Sleep Checker
  useEffect(() => {
    const checkSleep = setInterval(() => {
      if (isListening || isThinking || isSpeaking) {
        registerActivity();
        return;
      }
      const idleTime = Date.now() - lastActivityTimeRef.current;
      if (idleTime > INACTIVITY_SLEEP_MS && !isSleeping) {
        setIsSleeping(true);
      }
    }, 5000);

    return () => clearInterval(checkSleep);
  }, [isListening, isThinking, isSpeaking, isSleeping, registerActivity]);

  // 2. Global Event Listeners for Sensory Awareness (Mouse, Touch, Keys, Visibility)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      registerActivity();
      // Calculate normalized cursor position relative to screen center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const dx = Math.max(-1, Math.min(1, (e.clientX - centerX) / (centerX || 1)));
      const dy = Math.max(-1, Math.min(1, (e.clientY - centerY) / (centerY || 1)));

      targetGazeRef.current = { x: dx * 0.7, y: dy * 0.6 };
      setGazeX(targetGazeRef.current.x);
      setGazeY(targetGazeRef.current.y);
    };

    const handleTouch = () => registerActivity();
    const handleKeyDown = () => registerActivity();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        registerActivity();
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchstart", handleTouch, { passive: true });
    window.addEventListener("keydown", handleKeyDown, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [registerActivity]);

  // 3. Autonomous Natural Blinking (Random intervals between 2.5s and 6s)
  useEffect(() => {
    if (isSleeping) {
      setIsBlinking(false);
      return;
    }

    let isMounted = true;

    const scheduleBlink = () => {
      const nextBlinkDelay = 2500 + Math.random() * 3500;
      blinkTimeoutRef.current = setTimeout(() => {
        if (!isMounted || isSleeping) return;
        setIsBlinking(true);

        // Blink duration (140ms)
        setTimeout(() => {
          if (!isMounted) return;
          setIsBlinking(false);
          // 15% chance of double-blink
          if (Math.random() < 0.15) {
            setTimeout(() => {
              if (isMounted) {
                setIsBlinking(true);
                setTimeout(() => isMounted && setIsBlinking(false), 120);
              }
            }, 100);
          }
          scheduleBlink();
        }, 140);
      }, nextBlinkDelay);
    };

    scheduleBlink();

    return () => {
      isMounted = false;
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, [isSleeping]);

  // 4. Autonomous Idle Glance (Random gaze shifts when idle without mouse movement)
  useEffect(() => {
    if (isSleeping || isListening || isSpeaking) return;

    let isMounted = true;

    const scheduleGlance = () => {
      const glanceDelay = 4000 + Math.random() * 6000;
      glanceTimeoutRef.current = setTimeout(() => {
        if (!isMounted || isSleeping || isListening) return;

        if (isThinking) {
          // Look up and right when thinking
          setGazeX(0.55);
          setGazeY(-0.45);
        } else {
          // Glance randomly around or recenter
          const lookDirs = [
            { x: 0, y: 0 },
            { x: -0.5, y: 0 },
            { x: 0.5, y: 0 },
            { x: 0, y: -0.3 },
            { x: -0.3, y: 0.2 },
            { x: 0.3, y: 0.2 },
          ];
          const chosen = lookDirs[Math.floor(Math.random() * lookDirs.length)];
          setGazeX(chosen.x);
          setGazeY(chosen.y);
        }

        scheduleGlance();
      }, glanceDelay);
    };

    scheduleGlance();

    return () => {
      isMounted = false;
      if (glanceTimeoutRef.current) clearTimeout(glanceTimeoutRef.current);
    };
  }, [isSleeping, isListening, isThinking, isSpeaking]);

  // 5. Speech Cadence & Lip-Sync Modulation (Synthesizes mouth movement when TTS is speaking)
  useEffect(() => {
    if (isSpeaking) {
      let step = 0;
      speechIntervalRef.current = setInterval(() => {
        step++;
        // Harmonic modulation creating natural speech mouth open/close cycle
        const mouth = 0.25 + Math.sin(step * 0.8) * 0.45 + Math.cos(step * 1.6) * 0.3;
        setMouthOpenness(Math.max(0.1, Math.min(1, mouth)));
      }, 70);
    } else {
      setMouthOpenness(0);
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
    }

    return () => {
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
    };
  }, [isSpeaking]);

  // 6. Antenna Radar Pulse on Listening
  useEffect(() => {
    if (isListening) {
      setAntennaPulse(true);
    } else {
      setAntennaPulse(false);
    }
  }, [isListening]);

  return {
    activity: currentActivity,
    mood: currentMood,
    isBlinking,
    isSleeping,
    gazeX,
    gazeY,
    mouthOpenness,
    antennaPulse,
    wingSpeed,
    triggerHappyReaction,
  };
}
