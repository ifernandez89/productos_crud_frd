import {
  buildBackendHeaders,
  handleUnauthorizedResponse,
  resolveBackendBaseUrl,
} from "./auth.api";

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const getBaseUrl = () => resolveBackendBaseUrl();

const buildHeaders = (hasJson = false, targetUrl?: string) =>
  buildBackendHeaders({ json: hasJson, targetUrl });

// ─── Vision: analizar imagen en el chat ──────────────────────────────────────
export type VisionMode = "general" | "ocr" | "error" | "diagram" | "document";

export type VisionResponse = {
  answer: string;
  model: string;
  latencyMs: number;
  detectedLanguage?: string;
};

export async function analyzeImage(
  file: Blob,
  options?: { question?: string; mode?: VisionMode; sessionId?: string }
): Promise<VisionResponse> {
  const form = new FormData();
  form.append("file", file);
  if (options?.question) form.append("question", options.question);
  form.append("mode", options?.mode ?? "general");
  if (options?.sessionId) form.append("sessionId", options.sessionId);

  const baseUrl = getBaseUrl();
  const headers = buildHeaders(false, baseUrl);
  const res = await fetch(`${baseUrl}/api/jarbees/vision/analyze`, {
    method: "POST",
    headers,
    body: form,
  });

  if (!res.ok) {
    handleUnauthorizedResponse(res);
    const text = await res.text();
    throw new Error(`Vision analyze fallido (${res.status}): ${text}`);
  }

  return (await res.json()) as VisionResponse;
}

// ─── Library: ingestar PDF + responder pregunta ───────────────────────────────
export type PdfIngestResponse = {
  success: true;
  documentId: number;
  title: string;
  chunks: number;
  category?: string;
  answer?: string;
};

export async function ingestPdf(
  file: Blob,
  options?: { title?: string; category?: string; question?: string; sessionId?: string }
): Promise<PdfIngestResponse> {
  const form = new FormData();
  form.append("file", file);
  if (options?.title) form.append("title", options.title);
  if (options?.category) form.append("category", options.category);
  if (options?.question) form.append("question", options.question);
  if (options?.sessionId) form.append("sessionId", options.sessionId);

  const baseUrl = getBaseUrl();
  const headers = buildHeaders(false, baseUrl);
  const res = await fetch(`${baseUrl}/api/jarbees/library/document/pdf`, {
    method: "POST",
    headers,
    body: form,
  });

  if (!res.ok) {
    handleUnauthorizedResponse(res);
    const text = await res.text();
    throw new Error(`Ingestión PDF fallida (${res.status}): ${text}`);
  }

  return (await res.json()) as PdfIngestResponse;
}

export type IngestResponse = {
  success: true;
  documentId: number;
  title: string;
  chunks: number;
  category?: string;
};

export async function ingestUrl(url: string, category?: string): Promise<IngestResponse> {
  const baseUrl = getBaseUrl();
  const targetUrl = `${baseUrl}/api/jarbees/library/document/url`;
  const res = await fetch(targetUrl, {
    method: "POST",
    headers: buildHeaders(true, targetUrl),
    body: JSON.stringify({ url, category }),
  });

  if (!res.ok) {
    handleUnauthorizedResponse(res);
    const text = await res.text();
    throw new Error(`Ingestión fallida (${res.status}): ${text}`);
  }

  return (await res.json()) as IngestResponse;
}

export type FeedbackBody = {
  sessionId?: string;
  question: string;
  answer: string;
  score: number;
  comment?: string;
};

export async function sendFeedback(body: FeedbackBody): Promise<{ success: boolean }> {
  const baseUrl = getBaseUrl();
  const targetUrl = `${baseUrl}/api/jarbees/feedback`;
  const res = await fetch(targetUrl, {
    method: "POST",
    headers: buildHeaders(true, targetUrl),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    handleUnauthorizedResponse(res);
    const text = await res.text();
    throw new Error(`Feedback fallido (${res.status}): ${text}`);
  }

  return (await res.json()) as { success: boolean };
}

export type PlannerResponse = {
  success: true;
  plan: {
    id: number;
    objective: string;
    status: string;
    steps: Array<{ stepNumber: number; description: string; status: string }>;
  };
};

export async function createPlanner(objective: string, sessionId?: string): Promise<PlannerResponse> {
  const baseUrl = getBaseUrl();
  const targetUrl = `${baseUrl}/api/jarbees/planner`;
  const res = await fetch(targetUrl, {
    method: "POST",
    headers: buildHeaders(true, targetUrl),
    body: JSON.stringify({ objective, sessionId }),
  });

  if (!res.ok) {
    handleUnauthorizedResponse(res);
    const text = await res.text();
    throw new Error(`Planner fallido (${res.status}): ${text}`);
  }

  return (await res.json()) as PlannerResponse;
}

export type LibraryIndexItem = {
  id?: string | number;
  titulo: string;
  autor?: string;
  formato: string;
  archivo?: string;
  categorias?: string[];
  embeddings?: string;
  paginas?: number;
  cantidadChunks?: number;
};

export async function getLibraryIndex(): Promise<LibraryIndexItem[]> {
  const customUrl = typeof window !== "undefined" ? window.localStorage.getItem("jarbees_backend_url") : null;
  const lanHost = typeof window !== "undefined" && window.location.hostname !== "localhost" && !window.location.hostname.includes("ngrok") ? `http://${window.location.hostname}:4000` : null;

  const urlsToTry = Array.from(
    new Set(
      [
        customUrl,
        getBaseUrl(),
        lanHost,
        "http://localhost:4000",
        "http://127.0.0.1:4000",
      ]
        .filter((u): u is string => Boolean(u && u.trim().length > 0))
        .map((u) => u.trim().replace(/\/+$/, ""))
    )
  );

  for (const cleanUrl of urlsToTry) {
    try {
      const headers = buildBackendHeaders({ accept: true, targetUrl: cleanUrl });
      const res = await fetch(`${cleanUrl}/api/reader`, {
        method: "GET",
        headers,
      });

      if (res.status === 401) {
        handleUnauthorizedResponse(res);
        return [];
      }

      if (res.ok) {
        const data = await res.json();
        const list = data?.documentos || data?.documents || (Array.isArray(data) ? data : []);
        if (Array.isArray(list) && list.length > 0) {
          return list as LibraryIndexItem[];
        }
      }
    } catch (err) {
      console.warn(`[getLibraryIndex] Intentando ${cleanUrl} falló:`, err);
    }
  }

  // Intentar endpoint alternativo /api/jarbees/library/index
  for (const cleanUrl of urlsToTry) {
    try {
      const headers = buildBackendHeaders({ accept: true, targetUrl: cleanUrl });
      const res = await fetch(`${cleanUrl}/api/jarbees/library/index`, {
        method: "GET",
        headers,
      });

      if (res.status === 401) {
        handleUnauthorizedResponse(res);
        return [];
      }

      if (res.ok) {
        const data = await res.json();
        const list = data?.documentos || data?.documents || (Array.isArray(data) ? data : []);
        if (Array.isArray(list) && list.length > 0) {
          return list as LibraryIndexItem[];
        }
      }
    } catch {
      // Ignorar e intentar siguiente
    }
  }

  return [];
}

export type ReaderDocumentResponse = {
  documentId: string | number;
  title: string;
  author: string;
  paginas: number;
  cantidadChunks?: number;
  blocks: string[];
};

export async function getReaderDocument(documentId: string | number): Promise<ReaderDocumentResponse> {
  const customUrl = typeof window !== "undefined" ? window.localStorage.getItem("jarbees_backend_url") : null;
  const lanHost = typeof window !== "undefined" && window.location.hostname !== "localhost" && !window.location.hostname.includes("ngrok") ? `http://${window.location.hostname}:4000` : null;

  const urlsToTry = Array.from(
    new Set(
      [
        customUrl,
        getBaseUrl(),
        lanHost,
        "http://localhost:4000",
        "http://127.0.0.1:4000",
      ]
        .filter((u): u is string => Boolean(u && u.trim().length > 0))
        .map((u) => u.trim().replace(/\/+$/, ""))
    )
  );

  for (const cleanUrl of urlsToTry) {
    try {
      const headers = buildBackendHeaders({ accept: true, targetUrl: cleanUrl });
      const res = await fetch(`${cleanUrl}/api/reader/${encodeURIComponent(documentId)}`, {
        method: "GET",
        headers,
      });

      if (res.status === 401) {
        handleUnauthorizedResponse(res);
        throw new Error("Sesión de operador requerida (401) para abrir el documento.");
      }

      if (res.ok) {
        const data = await res.json();
        if (data && data.blocks && Array.isArray(data.blocks) && data.blocks.length > 0) {
          return data as ReaderDocumentResponse;
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("401")) throw err;
      // Probar siguiente
    }
  }

  throw new Error(`No se pudo obtener el documento ${documentId}`);
}

// ─── Voice: enviar audio grabado para transcripción y respuesta ──────────────────
export type VoiceChatResponse = {
  transcription: string;
  answer: string;
  audioUrl?: string;
  durationSeconds?: number;
};

export async function sendVoiceChat(
  audioBlob: Blob,
  options?: { sessionId?: string; questionHint?: string }
): Promise<VoiceChatResponse> {
  const form = new FormData();
  const ext = audioBlob.type.includes("ogg")
    ? "ogg"
    : audioBlob.type.includes("wav")
    ? "wav"
    : "webm";
  form.append("audio", audioBlob, `voice_message.${ext}`);
  if (options?.sessionId) form.append("sessionId", options.sessionId);
  if (options?.questionHint) form.append("question", options.questionHint);

  const customUrl = typeof window !== "undefined" ? window.localStorage.getItem("jarbees_backend_url") : null;
  const urlsToTry = Array.from(
    new Set(
      [
        customUrl,
        getBaseUrl(),
        "http://localhost:4000",
        "http://127.0.0.1:4000",
      ]
        .filter((u): u is string => Boolean(u && u.trim().length > 0))
        .map((u) => u.trim().replace(/\/+$/, ""))
    )
  );

  let lastError: Error | null = null;

  for (const cleanUrl of urlsToTry) {
    const headers = buildHeaders(false, cleanUrl);
    const endpoint = `${cleanUrl}/api/jarbees/voice/chat`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: form,
      });

      if (res.status === 401) {
        handleUnauthorizedResponse(res);
        throw new Error("Sesión de operador requerida (401) para voz.");
      }

      if (res.ok) {
        const data = await res.json();
        return {
          transcription:
            data?.transcription ||
            data?.transcript ||
            data?.pregunta ||
            data?.text ||
            "Mensaje de voz",
          answer:
            data?.answer ||
            data?.response ||
            data?.reply ||
            data?.respuesta ||
            "",
          audioUrl: data?.audioUrl,
          durationSeconds: data?.durationSeconds,
        };
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("401")) throw err;
      lastError = err as Error;
    }
  }

  throw (
    lastError ||
    new Error(
      "No se pudo conectar con el endpoint de voz del backend. Verificá que el backend esté activo."
    )
  );
}

export function connectGoogle(): void {
  if (typeof window === "undefined") return;
  window.location.assign(`${getBaseUrl()}/api/jarbees/google/login`);
}

const jarbeesApi = { ingestUrl, sendFeedback, createPlanner, connectGoogle, getLibraryIndex, getReaderDocument, sendVoiceChat };

export default jarbeesApi;
