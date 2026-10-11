// app/services/preguntas.api.ts

import { MAX_MESSAGE_LENGTH } from "@/lib/utils";

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BASE_URL = BACKEND_URL ?? "http://localhost:4000";

// ─── Keys localStorage ────────────────────────────────────────────────────────
const JARBEES_SESSION_KEY        = "jarbees_session_id";
const LAST_ASSISTANT_MESSAGE_KEY = "jarbees_last_assistant_message";
const ACTIVE_DISCIPLINE_KEY      = "jarbees_active_discipline_mode";
const GEO_CACHE_KEY              = "jarbees_geo_coords";
const GEO_CACHE_TTL_MS           = 24 * 60 * 60 * 1000;

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type JarBeesResponse = {
  answer: string;
  sessionId: string | null;
  lastMessage?: string;
  mode?: string;
  model?: string;
};

export interface Discipline {
  id: string;
  name: string;
  icon: string;
  category?: string;
  model?: string;
  description: string;
  suggestedPrompt: string;
  tags?: string[];
}

export const DEFAULT_DISCIPLINES: Discipline[] = [
  {
    id: "auto",
    name: "Automático",
    icon: "🧭",
    category: "Enrutador",
    model: "llama3.2:3b / Heurística",
    description: "Enrutamiento inteligente automático según la intención del prompt.",
    suggestedPrompt: "Escribe un mensaje o haz cualquier pregunta...",
    tags: ["auto", "router", "inteligente"],
  },
  {
    id: "chatbot",
    name: "Chat General",
    icon: "💬",
    category: "Conversación",
    model: "qwen2.5:7b",
    description: "Conversación fluida, razonamiento cotidiano y asistencia general libre de restricciones.",
    suggestedPrompt: "Hola, ¿en qué me puedes ayudar hoy?",
    tags: ["chat", "asistente", "general"],
  },
  {
    id: "coder",
    name: "Código & Dev",
    icon: "💻",
    category: "Programación",
    model: "qwen2.5-coder:7b",
    description: "Programación, debugging, refactorización y arquitectura en TypeScript/Python/SQL.",
    suggestedPrompt: "Escribe una función en TypeScript para...",
    tags: ["code", "dev", "typescript", "python"],
  },
  {
    id: "traductor",
    name: "Traductor",
    icon: "🌐",
    category: "Idiomas",
    model: "RogerBen/hy-mt1.5-1.8b:latest",
    description: "Traducción directa y rápida de textos, párrafos o subtítulos.",
    suggestedPrompt: "Traduce el siguiente texto al inglés...",
    tags: ["traduccion", "idiomas", "translate"],
  },
  {
    id: "reader",
    name: "Lector & Audio",
    icon: "🎙️",
    category: "Audio & TTS",
    model: "sematre/orpheus:it_es-3b",
    description: "Lectura de libros y PDFs optimizada para síntesis de voz (TTS).",
    suggestedPrompt: "Lee este extracto con tono pausado y claro...",
    tags: ["audio", "reader", "tts", "voz"],
  },
  {
    id: "audio",
    name: "Audio & Samples",
    icon: "🎚️",
    category: "Sonido & Estudio",
    model: "Audio DSP & IA",
    description: "Análisis de samples musicales (BPM, tono), exportación MP3 y masterización sonora.",
    suggestedPrompt: "¿Podrías analizar este sample de audio y decirme su BPM y escala/tono?",
    tags: ["audio", "samples", "bpm", "flstudio", "studioone", "mp3"],
  },
  {
    id: "ocr",
    name: "PDF / OCR",
    icon: "📄",
    category: "Documentos",
    model: "yemifo/qwen25-vl-3b-q4km:latest",
    description: "Extracción de texto, escaneo y estructuración de documentos.",
    suggestedPrompt: "Extrae el texto y estructura las secciones de este documento...",
    tags: ["ocr", "pdf", "escaneo", "texto"],
  },
  {
    id: "video",
    name: "Video Analysis",
    icon: "🎬",
    category: "Multimedia",
    model: "yemifo/qwen25-vl-3b-q4km:latest",
    description: "Análisis de frames, descripción visual y multimedia.",
    suggestedPrompt: "Analiza la escena del video y resume las acciones...",
    tags: ["video", "visual", "multimedia"],
  },
  {
    id: "rag",
    name: "Búsqueda RAG",
    icon: "🔎",
    category: "Búsqueda & RAG",
    model: "bge-m3:latest",
    description: "Recuperación vectorial sobre documentos y memoria permanente.",
    suggestedPrompt: "Busca en la biblioteca de documentos información sobre...",
    tags: ["rag", "busqueda", "documentos", "memoria"],
  },
  {
    id: "planner",
    name: "Planner",
    icon: "🧠",
    category: "Planificación",
    model: "Execution Engine",
    description: "Planificación y orquestación multi-paso de tareas complejas.",
    suggestedPrompt: "Crea un plan paso a paso para desarrollar...",
    tags: ["plan", "planner", "orquestacion"],
  },
  {
    id: "tools",
    name: "Herramientas",
    icon: "🛠️",
    category: "Acciones & Tools",
    model: "Tool Engine",
    description: "Acciones del sistema (Google Calendar, Tasks, Gmail, Clima, Web).",
    suggestedPrompt: "¿Qué eventos tengo agendados para hoy en el calendario?",
    tags: ["tools", "calendar", "gmail", "clima"],
  },
];

export type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
};

type GeoCoords = { latitude: number; longitude: number };
type GeoCache  = GeoCoords & { timestamp: number };

// ─── Mensajes de error ────────────────────────────────────────────────────────
export const SERVICE_ERRORS = {
  backend_unreachable: "⚠️ No pude conectarme al servidor. Verificá que el backend esté corriendo.",
  ollama_down:         "⚠️ El modelo de IA (Ollama) no está disponible en este momento. Intentá más tarde.",
  timeout:             "⚠️ La respuesta tardó demasiado. El servidor puede estar bajo carga, intentá de nuevo.",
  server_error:        "⚠️ Error interno del servidor. Si el problema persiste, reiniciá el backend.",
  network_error:       "⚠️ Sin conexión a internet. Verificá tu red e intentá de nuevo.",
  unknown:             "⚠️ Ocurrió un error inesperado. Intentá de nuevo.",
} as const;

export function classifyError(error: unknown): string {
  if (!(error instanceof Error)) return SERVICE_ERRORS.unknown;
  const msg = error.message.toLowerCase();

  if (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network request failed") ||
    msg.includes("econnrefused")
  ) {
    return typeof navigator !== "undefined" && !navigator.onLine
      ? SERVICE_ERRORS.network_error
      : SERVICE_ERRORS.backend_unreachable;
  }
  if (msg.includes("timeout") || msg.includes("aborted") || msg.includes("timed out"))
    return SERVICE_ERRORS.timeout;
  if (
    msg.includes("ollama") ||
    msg.includes("11434") ||
    msg.includes("503") ||
    msg.includes("service unavailable")
  )
    return SERVICE_ERRORS.ollama_down;
  if (
    msg.includes("500") || msg.includes("502") ||
    msg.includes("504") || msg.includes("error en la api")
  )
    return SERVICE_ERRORS.server_error;

  return `⚠️ ${error.message}`;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
const getStoredSessionId = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(JARBEES_SESSION_KEY);
};

const storeSessionId = (sessionId: string | null) => {
  if (typeof window === "undefined" || !sessionId) return;
  window.localStorage.setItem(JARBEES_SESSION_KEY, sessionId);
};

const storeLastAssistantMessage = (message: string | null) => {
  if (typeof window === "undefined" || message === null) return;
  window.localStorage.setItem(LAST_ASSISTANT_MESSAGE_KEY, message);
};

export const getLastAssistantMessage = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_ASSISTANT_MESSAGE_KEY);
};

export const getStoredDisciplineMode = (): string => {
  if (typeof window === "undefined") return "auto";
  return window.localStorage.getItem(ACTIVE_DISCIPLINE_KEY) || "auto";
};

export const storeDisciplineMode = (mode: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_DISCIPLINE_KEY, mode);
};

// ─── Geolocalización ─────────────────────────────────────────────────────────
const getCachedGeoCoords = (): GeoCoords | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as GeoCache;
    if (Date.now() - cache.timestamp > GEO_CACHE_TTL_MS) {
      window.localStorage.removeItem(GEO_CACHE_KEY);
      return null;
    }
    return { latitude: cache.latitude, longitude: cache.longitude };
  } catch { return null; }
};

const storeGeoCoords = (coords: GeoCoords) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      GEO_CACHE_KEY,
      JSON.stringify({ ...coords, timestamp: Date.now() })
    );
  } catch { /* ignore */ }
};

const getCurrentPosition = (): Promise<GeoCoords> =>
  new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocalización no soportada")); return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
    );
  });

const isWeatherQuery = (message: string) =>
  /\b(clima|tiempo|temperatura|lluvia|pron[oó]stico|meteorolog[ií]a|nublado|soleado|viento|tormenta|nevado|helada|humedad)\b/
    .test(message.toLowerCase());

const resolveGeoCoords = async (message: string): Promise<GeoCoords | null> => {
  if (!isWeatherQuery(message)) return null;
  const cached = getCachedGeoCoords();
  if (cached) return cached;
  try {
    const coords = await getCurrentPosition();
    storeGeoCoords(coords);
    return coords;
  } catch { return null; }
};

// ─── Headers helper ───────────────────────────────────────────────────────────
const buildHeaders = (targetUrl?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const isNgrok = targetUrl ? targetUrl.includes("ngrok") : (BASE_URL && BASE_URL.includes("ngrok"));
  if (isNgrok) {
    headers["ngrok-skip-browser-warning"] = "69420";
  }
  return headers;
};

// ─── Catálogo Dinámico de Especialistas / Disciplinas ─────────────────────────
export async function fetchDisciplines(): Promise<Discipline[]> {
  const endpoints = [
    `${BASE_URL}/api/aichat/disciplines`,
    `${BASE_URL}/aichat/disciplines`,
    `${BASE_URL}/api/jarbees/disciplines`,
    `${BASE_URL}/jarbees/disciplines`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: buildHeaders(url),
      });

      if (res.ok) {
        const data = await res.json();
        const list = data?.disciplines || (Array.isArray(data) ? data : []);
        if (Array.isArray(list) && list.length > 0) {
          // Merge with defaults to ensure all required disciplines exist
          const map = new Map<string, Discipline>();
          DEFAULT_DISCIPLINES.forEach((d) => map.set(d.id, d));
          list.forEach((item: Discipline) => {
            if (item && item.id) {
              const existing = map.get(item.id) || {};
              map.set(item.id, { ...existing, ...item });
            }
          });
          return Array.from(map.values());
        }
      }
    } catch {
      // Intentar el siguiente endpoint
    }
  }

  return DEFAULT_DISCIPLINES;
}

// ─── NIVEL 1: Obtener / crear sesión ─────────────────────────────────────────
/**
 * Llama a GET /api/jarbees/session?sessionId=xxx una sola vez al inicio.
 * Si el backend no tiene esa sesión, crea una nueva y la devuelve.
 * Guarda el sessionId resultante en localStorage.
 */
export async function initSession(): Promise<string | null> {
  try {
    const stored = getStoredSessionId();
    const url = stored
      ? `${BASE_URL}/api/jarbees/session?sessionId=${stored}`
      : `${BASE_URL}/api/jarbees/session`;

    const res = await fetch(url, { method: "GET", headers: buildHeaders(url) });
    if (!res.ok) return stored;

    const data = (await res.json()) as { sessionId: string };
    storeSessionId(data.sessionId);
    return data.sessionId;
  } catch {
    return getStoredSessionId();
  }
}

// ─── NIVEL 1: Recuperar historial al recargar ─────────────────────────────────
/**
 * Llama a GET /api/jarbees/history?sessionId=xxx para reconstruir el chat.
 */
export async function fetchHistory(sessionId: string): Promise<HistoryMessage[]> {
  try {
    const url = `${BASE_URL}/api/jarbees/history?sessionId=${sessionId}`;
    const res = await fetch(url, { method: "GET", headers: buildHeaders(url) });
    if (!res.ok) return [];
    const data = (await res.json()) as { messages: HistoryMessage[] };
    return Array.isArray(data.messages) ? data.messages : [];
  } catch {
    return [];
  }
}

// ─── NIVEL 1/2/3: Enviar pregunta con modo de especialista ───────────────────
export async function hacerPregunta(
  message: string,
  provider: "ollama" | "openrouter" = "ollama",
  options?: {
    mode?: string;
    latitude?: number;
    longitude?: number;
    autoGeolocation?: boolean;
  }
): Promise<JarBeesResponse> {
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Mensaje demasiado largo. Máximo ${MAX_MESSAGE_LENGTH} caracteres.`);
  }

  try {
    const sessionId = getStoredSessionId();
    const mode = options?.mode || getStoredDisciplineMode();

    let latitude: number | undefined;
    let longitude: number | undefined;

    if (options?.latitude !== undefined && options?.longitude !== undefined) {
      latitude = options.latitude;
      longitude = options.longitude;
    } else if (options?.autoGeolocation) {
      const coords = await resolveGeoCoords(message);
      if (coords) { latitude = coords.latitude; longitude = coords.longitude; }
    }

    const body: Record<string, unknown> = {
      message,
      pregunta: message,
      sessionId,
      provider,
      mode,
    };

    if (latitude !== undefined && longitude !== undefined) {
      body.latitude = latitude;
      body.longitude = longitude;
    }

    // Intentar primero con el endpoint principal de consulta
    const url = `${BASE_URL}/api/jarbees/query`;
    let res = await fetch(url, {
      method: "POST",
      headers: buildHeaders(url),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      // Fallback a /aichat/preguntar
      try {
        const altUrl = `${BASE_URL}/aichat/preguntar`;
        const altRes = await fetch(altUrl, {
          method: "POST",
          headers: buildHeaders(altUrl),
          body: JSON.stringify(body),
        });
        if (altRes.ok) {
          res = altRes;
        }
      } catch {
        // mantener el error original si falla fallback
      }
    }

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Error en la API: ${errorBody}`);
    }

    const data = (await res.json()) as JarBeesResponse;
    if (data.sessionId) storeSessionId(data.sessionId);

    const lastMessage = data.lastMessage ?? data.answer;
    storeLastAssistantMessage(lastMessage);

    return { ...data, lastMessage, mode };
  } catch (error) {
    throw error instanceof Error ? error : new Error("Ocurrió un error desconocido.");
  }
}
