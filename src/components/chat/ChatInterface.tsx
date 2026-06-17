"use client";
import { useState, useEffect, useRef } from "react";
import { ChatHeroSection } from "./ChatHeroSection";
import { ChatPanel } from "./ChatPanel";
import { ChatInputBar } from "./ChatInputBar";
import { hacerPregunta, getLastAssistantMessage } from "../../app/services/preguntas.api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  responseTime?: number; // en milisegundos
  feedback?: "up" | "down"; // feedback del usuario
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastAssistantMessage, setLastAssistantMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const workspaceName = "JarBees Workspace";
  const documents = [
    "Manual de voz",
    "Guía de prompts",
    "Resumen de entrenamiento",
  ];
  const memoryItems = [
    "Contexto de usuario activo",
    "Preferencias de estilo",
    "Última tarea guardada",
  ];
  const sources = ["Local", "Ollama", "Documentos"];

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
      const { answer, sessionId, lastMessage } = await hacerPregunta(inputValue, "ollama");
      const endTime = performance.now(); // Rastrear tiempo fin
      const responseTime = endTime - startTime; // Calcular tiempo total

      const currentLastMessage = lastMessage ?? answer;
      setLastAssistantMessage(currentLastMessage);

      // Añadir mensaje asistente vacío para streaming visual
      const assistantId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        responseTime,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Simular streaming token-level mostrando incrementalmente
      const tokens = answer.split(/(\s+)/); // conservar espacios
      let accumulated = "";
      const interval = 40; // ms por "token"
      tokens.forEach((tok, idx) => {
        setTimeout(() => {
          accumulated += tok;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
          );
          // al final del stream
          if (idx === tokens.length - 1) {
            setIsTyping(false);
            // Speak response if audio enabled
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

  const handleRepeatLast = () => {
    const lastMessage = getLastAssistantMessage();
    if (!lastMessage) {
      console.warn("No hay último mensaje guardado para repetir.");
      return;
    }

    const repeatMessage: Message = {
      id: `${Date.now()}-repeat`,
      role: "assistant",
      content: lastMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, repeatMessage]);
    if (audioEnabled && speechSupported) {
      speakText(lastMessage);
    }
  };

  const handleFeedback = (messageId: string, type: "up" | "down") => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        // Toggle: if same feedback clicked again, remove it
        if (m.feedback === type) {
          return { ...m, feedback: undefined } as Message;
        }
        return { ...m, feedback: type };
      })
    );
  };

  const handleRegenerate = async (messageId: string) => {
    if (isTyping) return;

    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    const previousUserMessage = [...messages]
      .slice(0, messageIndex)
      .reverse()
      .find((m) => m.role === "user");

    const prompt = previousUserMessage?.content?.trim();
    if (!prompt) return;

    setIsTyping(true);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, content: "", responseTime: undefined } : m
      )
    );

    const startTime = performance.now();

    try {
      const { answer, sessionId } = await hacerPregunta(prompt, "ollama");
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      const tokens = answer.split(/(\s+)/);
      let accumulated = "";
      const interval = 40;

      tokens.forEach((tok, idx) => {
        setTimeout(() => {
          accumulated += tok;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId ? { ...m, content: accumulated, responseTime } : m
            )
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
      console.error("Error al regenerar:", error);
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
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
              <span className="text-base font-bold text-white">🧠</span>
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-semibold text-slate-100 sm:text-lg">JarBees</h1>
              <p className="text-[11px] text-slate-400 sm:text-xs">Llama 3.2 3B • Local</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300 sm:inline-flex">🟢 Local</span>
            <button
              onClick={handleRepeatLast}
              className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-800"
              title="Repetir última respuesta"
            >
              🔁 Repetir
            </button>
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
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            onFeedback={handleFeedback}
            onRegenerate={handleRegenerate}
            workspaceName={workspaceName}
            documents={documents}
            memoryItems={memoryItems}
            sources={sources}
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
