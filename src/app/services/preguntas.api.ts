// app/services/preguntas.api.ts

import { MAX_MESSAGE_LENGTH } from "@/lib/utils";

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BASE_URL = BACKEND_URL ?? "http://localhost:4000";
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const JARBEES_SESSION_KEY = "jarbees_session_id";
const LAST_ASSISTANT_MESSAGE_KEY = "jarbees_last_assistant_message";
const GEO_CACHE_KEY = "jarbees_geo_coords";
const GEO_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

type JarBeesResponse = {
  answer: string;
  sessionId: string | null;
  lastMessage?: string;
};

type GeoCoords = {
  latitude: number;
  longitude: number;
};

type GeoCache = GeoCoords & {
  timestamp: number;
};

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
    return {
      latitude: cache.latitude,
      longitude: cache.longitude,
    };
  } catch {
    return null;
  }
};

const storeGeoCoords = (coords: GeoCoords) => {
  if (typeof window === "undefined") return;
  try {
    const cache: GeoCache = {
      ...coords,
      timestamp: Date.now(),
    };
    window.localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage errors
  }
};

const getCurrentPosition = (): Promise<GeoCoords> => {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocalización no soportada"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000,
      }
    );
  });
};

const isWeatherQuery = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return /\b(clima|tiempo|temperatura|lluvia|pron[oó]stico|meteorolog[ií]a|nublado|soleado|viento|tormenta|nevado|helada|humedad)\b/.test(normalized);
};

const resolveGeoCoords = async (message: string): Promise<GeoCoords | null> => {
  if (!isWeatherQuery(message)) return null;
  const cached = getCachedGeoCoords();
  if (cached) return cached;

  try {
    const coords = await getCurrentPosition();
    storeGeoCoords(coords);
    return coords;
  } catch {
    return null;
  }
};

export const getLastAssistantMessage = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_ASSISTANT_MESSAGE_KEY);
};

export async function hacerPregunta(
  message: string,
  provider: "ollama" | "openrouter" = "ollama",
  options?: { latitude?: number; longitude?: number; autoGeolocation?: boolean }
): Promise<JarBeesResponse> {
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Mensaje demasiado largo. Máximo ${MAX_MESSAGE_LENGTH} caracteres.`);
  }

  try {
    const sessionId = getStoredSessionId();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (API_TOKEN) headers["Authorization"] = `Bearer ${API_TOKEN}`;

    let latitude: number | undefined;
    let longitude: number | undefined;

    if (options?.latitude !== undefined && options?.longitude !== undefined) {
      latitude = options.latitude;
      longitude = options.longitude;
    } else if (options?.autoGeolocation) {
      const coords = await resolveGeoCoords(message);
      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
      }
    }

    const body: Record<string, unknown> = {
      message,
      sessionId,
      provider,
    };

    if (latitude !== undefined && longitude !== undefined) {
      body.latitude = latitude;
      body.longitude = longitude;
    }

    const res = await fetch(`${BASE_URL}/api/jarbees/query`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Error en la API: ${errorBody}`);
    }

    const data = (await res.json()) as JarBeesResponse;
    if (data.sessionId) {
      storeSessionId(data.sessionId);
    }

    const lastMessage = data.lastMessage ?? data.answer;
    storeLastAssistantMessage(lastMessage);

    return {
      ...data,
      lastMessage,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Ocurrió un error desconocido.");
    }
  }
}
