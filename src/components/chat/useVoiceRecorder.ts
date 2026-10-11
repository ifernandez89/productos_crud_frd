"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface VoiceRecorderState {
  isRecording: boolean;
  recordingDuration: number; // segundos transcurridos
  audioLevels: number[]; // 5 niveles (0.1 a 1.0) para visualizador de ondas
  error: string | null;
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>([0.15, 0.2, 0.15, 0.25, 0.15]);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Limpieza total al desmontar
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  const cleanupResources = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
  };

  // Bucle para analizar amplitud de audio y animar la onda
  const startAudioAnalysis = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevels = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Tomar 5 muestras del espectro
        const step = Math.max(1, Math.floor(bufferLength / 5));
        const levels = [0, 1, 2, 3, 4].map((i) => {
          const raw = dataArray[i * step] || 0;
          const normalized = Math.min(1, Math.max(0.15, raw / 180));
          return normalized;
        });

        setAudioLevels(levels);
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };

      updateLevels();
    } catch (err) {
      console.warn("Visualizador de audio no soportado o bloqueado:", err);
      // Animación simulada de fallback si falla AudioContext
      const fallbackInterval = setInterval(() => {
        setAudioLevels([
          0.2 + Math.random() * 0.5,
          0.3 + Math.random() * 0.6,
          0.4 + Math.random() * 0.5,
          0.3 + Math.random() * 0.6,
          0.2 + Math.random() * 0.4,
        ]);
      }, 120);
      timerRef.current = fallbackInterval;
    }
  };

  const startRecording = useCallback(async (): Promise<boolean> => {
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Tu navegador no soporta grabación de audio nativa.");
      return false;
    }

    try {
      cleanupResources();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Determinar MIME type soportado
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
          mimeType = "audio/ogg;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else {
          mimeType = "";
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(250); // trozos cada 250ms
      setIsRecording(true);
      setRecordingDuration(0);

      // Temporizador de segundos transcurridos
      const timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      timerRef.current = timer;

      // Iniciar analizador para animación de ondas
      startAudioAnalysis(stream);
      return true;
    } catch (err: unknown) {
      console.error("Error al iniciar grabación:", err);
      const errObj = err as Error;
      if (errObj.name === "NotAllowedError" || errObj.name === "PermissionDeniedError") {
        setError("Permiso de micrófono denegado en tu navegador.");
      } else {
        setError("No se pudo acceder al micrófono.");
      }
      cleanupResources();
      setIsRecording(false);
      return false;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<{ blob: Blob; duration: number } | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        cleanupResources();
        setIsRecording(false);
        resolve(null);
        return;
      }

      const finalDuration = recordingDuration;

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        cleanupResources();
        setIsRecording(false);
        setRecordingDuration(0);
        setAudioLevels([0.15, 0.2, 0.15, 0.25, 0.15]);
        resolve({ blob: audioBlob, duration: finalDuration });
      };

      try {
        recorder.stop();
      } catch {
        cleanupResources();
        setIsRecording(false);
        resolve(null);
      }
    });
  }, [recordingDuration]);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      try {
        recorder.stop();
      } catch {
        // ignore
      }
    }
    audioChunksRef.current = [];
    cleanupResources();
    setIsRecording(false);
    setRecordingDuration(0);
    setAudioLevels([0.15, 0.2, 0.15, 0.25, 0.15]);
  }, []);

  return {
    isRecording,
    recordingDuration,
    audioLevels,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
