export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    const custom = window.localStorage.getItem("jarbees_backend_url");
    if (custom && custom.trim().length > 0) {
      return custom.trim().replace(/\/$/, "");
    }
    const hostname = window.location.hostname;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1" && !hostname.endsWith("github.io")) {
      return `http://${hostname}:4000`;
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

const FALLBACK_TITLES: { titulo: string; autor?: string }[] = [
  { titulo: "El Plano Astral", autor: "Charles Webster Leadbeater" },
  { titulo: "Adventures Beyond the Body", autor: "William Buhlman" },
  { titulo: "Los Nueve Ritos del Munay-Ki", autor: "Tradición Q'ero / Alberto Villoldo" },
  { titulo: "Herbario y Plantas Medicinales", autor: "Recopilación propia" },
  { titulo: "Sanaciones Populares y Oraciones Curativas", autor: "Tradición popular regional" },
  { titulo: "Angeles Arrien Las Cuatro Sendas del Chaman", autor: "Angeles Arrien" },
  { titulo: "The Etheric Double: The Health Aura of Man", autor: "Arthur E. Powell" },
  { titulo: "El Kybalion", autor: "Tres Iniciados / Hermes Trismegisto" },
  { titulo: "El hombre y sus símbolos", autor: "Carl Gustav Jung" },
  { titulo: "La Doctrina Secreta", autor: "Helena Petrovna Blavatsky" },
];

export async function getLibraryIndex(): Promise<LibraryIndexItem[]> {
  const baseUrl = getBaseUrl();
  const headers = buildHeaders(false);

  // 1. Intentar /api/reader
  try {
    const res = await fetch(`${baseUrl}/api/reader`, {
      method: "GET",
      headers,
    });
    if (res.ok) {
      const data = await res.json();
      const docs = data?.documentos || data?.documents || (Array.isArray(data) ? data : null);
      if (Array.isArray(docs) && docs.length > 0) {
        return docs as LibraryIndexItem[];
      }
    }
  } catch (err) {
    console.warn(`Error consultando /api/reader en ${baseUrl}:`, err);
  }

  // 2. Fallback /api/jarbees/library/index
  try {
    const res = await fetch(`${baseUrl}/api/jarbees/library/index`, {
      method: "GET",
      headers,
    });
    if (res.ok) {
      const data = await res.json();
      const docs = data?.documentos || data?.documents || (Array.isArray(data) ? data : null);
      if (Array.isArray(docs) && docs.length > 0) {
        return docs as LibraryIndexItem[];
      }
    }
  } catch (err) {
    console.warn(`Error consultando /api/jarbees/library/index en ${baseUrl}:`, err);
  }

  // 3. Fallback estático para asegurar que nunca se rompa la vista
  return FALLBACK_TITLES.map((item) => ({
    id: item.titulo,
    titulo: item.titulo,
    autor: item.autor,
    formato: "pdf",
  }));
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
  const headers = buildHeaders(false);

  try {
    const res = await fetch(`${baseUrl}/api/reader/${encodeURIComponent(documentId)}`, {
      method: "GET",
      headers,
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.blocks && Array.isArray(data.blocks) && data.blocks.length > 0) {
        return data as ReaderDocumentResponse;
      }
    }
  } catch (err) {
    console.warn(`Error al consultar documento ${documentId} en ${baseUrl}:`, err);
  }

  try {
    const res = await fetch(`${baseUrl}/api/jarbees/library/document/${encodeURIComponent(documentId)}`, {
      method: "GET",
      headers,
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.blocks && Array.isArray(data.blocks) && data.blocks.length > 0) {
        return data as ReaderDocumentResponse;
      }
    }
  } catch (err) {
    console.warn(`Error al consultar /api/jarbees/library/document/${documentId}:`, err);
  }

  return {
    documentId,
    title: String(documentId),
    author: "Autor Desconocido",
    paginas: 150,
    blocks: [
      `Inicio de la lectura de "${documentId}". Este documento se procesa en bloques para generar audiolibros fluidos.`,
      `Bloque 2: Continuación de la lectura interactiva. Mientras escuchas este fragmento, el motor genera el siguiente bloque de audio en segundo plano.`,
      `Bloque 3: JarBees Audiobook AI integra modelos locales TTS para ofrecer una experiencia continua y optimizada.`,
    ],
  };
}

export function connectGoogle(): void {
  if (typeof window === "undefined") return;
  window.location.assign(`${getBaseUrl()}/api/jarbees/google/login`);
}

const jarbeesApi = { ingestUrl, sendFeedback, createPlanner, connectGoogle, getLibraryIndex, getReaderDocument, getBaseUrl, setBackendUrl };

export default jarbeesApi;
