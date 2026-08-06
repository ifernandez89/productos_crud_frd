export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    const custom = window.localStorage.getItem("jarbees_backend_url");
    if (custom && custom.trim().length > 0) {
      return custom.trim().replace(/\/$/, "");
    }
  }
  return (BACKEND_URL || "http://localhost:4000").replace(/\/$/, "");
}

export function setBackendUrl(url: string): void {
  if (typeof window !== "undefined") {
    if (url && url.trim().length > 0) {
      window.localStorage.setItem("jarbees_backend_url", url.trim().replace(/\/$/, ""));
    } else {
      window.localStorage.removeItem("jarbees_backend_url");
    }
  }
}

const buildHeaders = (hasJson = false) => {
  const headers: Record<string, string> = {
    "ngrok-skip-browser-warning": "69420",
  };
  if (hasJson) headers["Content-Type"] = "application/json";
  if (API_TOKEN) headers["Authorization"] = `Bearer ${API_TOKEN}`;
  return headers;
};

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

  const headers = buildHeaders(false);
  const res = await fetch(`${getBaseUrl()}/api/jarbees/vision/analyze`, {
    method: "POST",
    headers,
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vision analyze fallido: ${text}`);
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

  const headers = buildHeaders(false);
  const res = await fetch(`${getBaseUrl()}/api/jarbees/library/document/pdf`, {
    method: "POST",
    headers,
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ingestión PDF fallida: ${text}`);
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
  const res = await fetch(`${getBaseUrl()}/api/jarbees/library/document/url`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify({ url, category }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ingestión fallida: ${text}`);
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
  const res = await fetch(`${getBaseUrl()}/api/jarbees/feedback`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Feedback fallido: ${text}`);
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
  const res = await fetch(`${getBaseUrl()}/api/jarbees/planner`, {
    method: "POST",
    headers: buildHeaders(true),
    body: JSON.stringify({ objective, sessionId }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Planner fallido: ${text}`);
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
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/reader`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "ngrok-skip-browser-warning": "69420",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al consultar /api/reader (${res.status}): ${text}`);
  }

  const data = await res.json();
  const list = data?.documentos || data?.documents || (Array.isArray(data) ? data : []);
  return list as LibraryIndexItem[];
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
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/reader/${encodeURIComponent(documentId)}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "ngrok-skip-browser-warning": "69420",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al obtener documento ${documentId} (${res.status}): ${text}`);
  }

  return (await res.json()) as ReaderDocumentResponse;
}

export function connectGoogle(): void {
  if (typeof window === "undefined") return;
  window.location.assign(`${getBaseUrl()}/api/jarbees/google/login`);
}

const jarbeesApi = { ingestUrl, sendFeedback, createPlanner, connectGoogle, getLibraryIndex, getReaderDocument, getBaseUrl, setBackendUrl };

export default jarbeesApi;
