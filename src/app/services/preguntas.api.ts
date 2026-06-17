// app/services/preguntas.api.ts

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const JARVIS_SESSION_KEY = "jarvis_session_id";

type JarvisResponse = {
  answer: string;
  sessionId: string | null;
};

const getStoredSessionId = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(JARVIS_SESSION_KEY);
};

const storeSessionId = (sessionId: string | null) => {
  if (typeof window === "undefined" || !sessionId) return;
  window.localStorage.setItem(JARVIS_SESSION_KEY, sessionId);
};

export async function hacerPregunta(
  message: string,
  provider: "ollama" | "openrouter" = "ollama"
): Promise<JarvisResponse> {
  try {
    const sessionId = getStoredSessionId();
    const res = await fetch(`${BACKEND_URL}/api/jarvis/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        sessionId,
        provider,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Error en la API: ${errorBody}`);
    }

    const data = (await res.json()) as JarvisResponse;
    if (data.sessionId) {
      storeSessionId(data.sessionId);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Ocurrió un error desconocido.");
    }
  }
}
