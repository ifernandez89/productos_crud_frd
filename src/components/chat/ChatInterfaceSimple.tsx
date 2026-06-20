"use client";
import { useState, useEffect, useRef } from "react";
import { ChatInputSimple } from "./ChatInputSimple";
import { ChatMessageCompact } from "./ChatMessageCompact";
import { loadConversation, saveConversation } from "@/lib/db";
import { hacerPregunta } from "../../app/services/preguntas.api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  responseTime?: number;
}

interface SpeechRecognitionEventLike extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      length: number;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike {
  start: () => void;
  stop: () => void;
  abort: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
}

export default function ChatInterfaceSimple() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [audioEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const MAX_IN_MEMORY = 200;

  // Nombres de voces masculinas conocidas
  const MALE_VOICE_NAMES = [
    "Microsoft Pablo", "Microsoft Jorge", "Google español",
    "Jorge", "Pablo", "Diego", "Carlos", "Ricardo", "Miguel",
  ];

  const FEMALE_KEYWORDS = ["female", "femenina", "mujer", "woman", "laura", "helena",
    "mónica", "monica", "paulina", "luciana", "isabela", "rosa", "sabina", "lupe"];

  const selectMaleVoice = (): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const esVoices = voices.filter((v) =>
      v.lang.startsWith("es") || v.lang.startsWith("ES"),
    );
    const pool = esVoices.length ? esVoices : voices;

    for (const name of MALE_VOICE_NAMES) {
      const match = pool.find((v) =>
        v.name.toLowerCase().includes(name.toLowerCase()),
      );
      if (match) return match;
    }

    const nonFemale = pool.filter(
      (v) => !FEMALE_KEYWORDS.some((kw) => v.name.toLowerCase().includes(kw)),
    );
    return nonFemale[0] ?? pool[0] ?? null;
  };

  const getOrLoadVoice = (callback: (voice: SpeechSynthesisVoice | null) => void) => {
    if (voiceRef.current) {
      callback(voiceRef.current);
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      voiceRef.current = selectMaleVoice();
      callback(voiceRef.current);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        voiceRef.current = selectMaleVoice();
        window.speechSynthesis.onvoiceschanged = null;
        callback(voiceRef.current);
      };
    }
  };

  const speakText = (text: string) => {
    if (!speechSupported || !audioEnabled) return;

    window.speechSynthesis.cancel();

    getOrLoadVoice((voice) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.rate = 0.92;
      utterance.pitch = 0.75;
      utterance.volume = 1;

      if (voice) utterance.voice = voice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    });
  };

  // Load conversation
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await loadConversation('default');
        if (mounted && saved?.messages) {
          const msgs = Array.isArray(saved.messages) ? saved.messages : [];
          setMessages(msgs.slice(-MAX_IN_MEMORY));
        }
      } catch {
        // ignore
      }
    })();

    return () => { mounted = false; };
  }, []);

  // Save conversation
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        saveConversation('default', messages);
      } catch {
        // ignore
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [messages]);

  // Check browser support
  useEffect(() => {
    const SpeechRecognitionAPI = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new (SpeechRecognitionAPI as unknown as new () => SpeechRecognitionLike)();
      recognitionRef.current.lang = "es-ES";
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => setIsListening(true);
      
      recognitionRef.current.onend = () => {
        if (recognitionRef.current !== null && isListening) {
          try {
            recognitionRef.current.start();
            return;
          } catch {
            // ignore
          }
        }
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEventLike) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript;
        setInputValue(transcript);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEventLike) => {
        if (event.error !== "network" && event.error !== "aborted" && event.error !== "no-speech") {
          console.warn("Speech recognition error:", event.error);
        }
      };
    }

    if ("speechSynthesis" in window) {
      setSpeechSupported(true);
    }
  }, [isListening]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (msg: Message) => {
    setMessages((prev) => {
      const next = [...prev, msg];
      if (next.length > MAX_IN_MEMORY) return next.slice(-MAX_IN_MEMORY);
      return next;
    });
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      recognition?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.warn("No se pudo iniciar el reconocimiento de voz:", error);
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputValue("");
    setIsTyping(true);
    const startTime = performance.now();

    try {
      const { answer } = await hacerPregunta(inputValue, "ollama");
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      const assistantId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        responseTime,
      };

      addMessage(assistantMessage);

      // Streaming simulation
      const tokens = answer.split(/(\s+)/);
      let accumulated = "";
      const interval = 40;
      tokens.forEach((tok, idx) => {
        setTimeout(() => {
          accumulated += tok;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
          );
          if (idx === tokens.length - 1) {
            setIsTyping(false);
            if (audioEnabled && !isSpeaking) {
              speakText(answer);
            }
          }
        }, interval * idx);
      });
    } catch (error) {
      console.error("Error:", error);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xl shadow-lg shadow-cyan-500/20">
              🐝
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-100">JarBees</h1>
              <p className="text-xs text-slate-400">Modelo local</p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
            🟢 Local
          </span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isTyping && (
          <div className="flex h-full items-center justify-center px-4">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-3xl shadow-lg shadow-cyan-500/20">
                🐝
              </div>
              <h2 className="text-xl font-semibold text-slate-100">JarBees está listo</h2>
              <p className="mt-2 text-sm text-slate-400">
                Iniciá una conversación por voz o texto
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessageCompact
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}

        {isTyping && (
          <ChatMessageCompact
            role="assistant"
            content="Escribiendo..."
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInputSimple
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        onVoiceToggle={toggleVoiceInput}
        isListening={isListening}
        isTyping={isTyping}
      />
    </div>
  );
}
