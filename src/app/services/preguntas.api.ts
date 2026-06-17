// app/services/preguntas.api.ts

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const JARBEES_SESSION_KEY = "jarbees_session_id";
const LAST_ASSISTANT_MESSAGE_KEY = "jarbees_last_assistant_message";

type JarBeesResponse = {
  answer: string;
  sessionId: string | null;
  lastMessage?: string;
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

export const getLastAssistantMessage = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_ASSISTANT_MESSAGE_KEY);
};

export async function hacerPregunta(
  message: string,
  provider: "ollama" | "openrouter" = "ollama"
): Promise<JarBeesResponse> {
  try {
    const sessionId = getStoredSessionId();
    const res = await fetch(`${BACKEND_URL}/api/jarbees/query`, {
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
