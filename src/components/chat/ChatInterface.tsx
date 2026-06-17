"use client";
import { useState, useEffect, useRef } from "react";
import { ChatHeroSection } from "./ChatHeroSection";
import { ChatPanel } from "./ChatPanel";
import { ChatInputBar } from "./ChatInputBar";
import { hacerPregunta } from "../../app/services/preguntas.api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  responseTime?: number; // en milisegundos
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

export default function ChatInterface() {
  const [view, setView] = useState<"hero" | "chat">("hero");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognitionAPI = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new (SpeechRecognitionAPI as unknown as new () => SpeechRecognitionLike)();
      recognitionRef.current.lang = "es-ES";
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event: SpeechRecognitionEventLike) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
      };
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEventLike) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }

    if ("speechSynthesis" in window) {
      setSpeechSupported(true);
    }
  }, []);

  // Handle voice input
  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  // Handle speech synthesis
  const speakText = (text: string) => {
    if (!speechSupported || !audioEnabled) return;

    // Cancel any currently speaking utterances
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Handle message submission
  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    const startTime = performance.now(); // Rastrear tiempo inicio

    try {
      const response = await hacerPregunta(inputValue, true);
      const endTime = performance.now(); // Rastrear tiempo fin
      const responseTime = endTime - startTime; // Calcular tiempo total
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        responseTime, // Agregar tiempo de respuesta
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);

      // Speak response if audio enabled
      if (audioEnabled && !isSpeaking) {
        speakText(response);
      }
    } catch (error) {
      console.error("Error:", error);
      setIsTyping(false);
    }
  };

  // Handle action clicks
  const handleActionClick = (action: "image" | "write" | "search") => {
    // Implementar lógica específica por acción
    const messages: Message[] = [
      {
        id: Date.now().toString(),
        role: "assistant",
        content: `He seleccionado la acción: ${action}. ¿Qué te gustaría hacer exactamente?`,
        timestamp: new Date(),
      },
    ];
    setMessages((prev) => [...prev, ...messages]);
    setView("chat");
  };

  // Handle chat start
  const handleChatStart = () => {
    setView("chat");
  };

  // Handle clear chat
  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-white"
              >
                <path d="M11.7 2.805a.75.75 0 01.6 0A27.2 27.2 0 0112 4.08c2.565.313 5.056.755 7.47 1.349a.75.75 0 01.531 1.145l-1.937 1.938a.75.75 0 00-.176.53c.24.804.461 1.625.66 2.46a.75.75 0 01-.721.996H3.889a.75.75 0 01-.721-.996c.199-.835.42-1.656.66-2.46a.75.75 0 00-.176-.53L.544 4.33a.75.75 0 01.531-1.145A27.2 27.2 0 0112 4.08c2.565.313 5.056.755 7.47 1.349z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">Asistente IA</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`rounded-full p-2 transition-colors ${
                audioEnabled ? "text-cyan-400" : "text-slate-500"
              }`}
              title={audioEnabled ? "Desactivar audio" : "Activar audio"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path d="M13.5 4.06c0-1.336-1.098-2.414-2.414-2.414a2.414 2.414 0 00-2.414 2.414v1.383l-1.85 1.85a.75.75 0 001.06 1.06l1.85-1.85v1.383a2.414 2.414 0 002.414 2.414 2.414 2.414 0 002.414-2.414A2.414 2.414 0 0013.5 4.06z" />
                {audioEnabled && (
                  <path d="M15.332 10.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5a.75.75 0 01.75-.75z" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {view === "hero" ? (
          <ChatHeroSection
            onActionClick={handleActionClick}
            onChatStart={handleChatStart}
          />
        ) : (
          <ChatPanel
            messages={messages}
            isTyping={isTyping}
            onClearChat={handleClearChat}
          />
        )}
      </main>

      {/* Input Bar (only in chat view) */}
      {view === "chat" && (
        <ChatInputBar
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          onVoiceStart={toggleVoiceInput}
          onVoiceStop={toggleVoiceInput}
          isListening={isListening}
          audioEnabled={audioEnabled}
          onToggleAudio={() => setAudioEnabled(!audioEnabled)}
          isSpeaking={isSpeaking}
          onToggleSpeaking={() => setIsSpeaking(!isSpeaking)}
          onActionClick={handleActionClick}
        />
      )}
    </div>
  );
}
