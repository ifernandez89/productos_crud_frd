export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BASE_URL = BACKEND_URL ?? "http://localhost:4000";
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

const buildHeaders = (hasJson = false) => {
  const headers: Record<string, string> = {};
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

  const headers = buildHeaders(false); // sin Content-Type, lo pone el browser
  const res = await fetch(`${BASE_URL}/api/jarbees/vision/analyze`, {
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
  answer?: string; // presente cuando se envía question
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
  const res = await fetch(`${BASE_URL}/api/jarbees/library/document/pdf`, {
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
  const res = await fetch(`${BASE_URL}/api/jarbees/library/document/url`, {
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
  score: number; // 1-5 or -1/1
  comment?: string;
};

export async function sendFeedback(body: FeedbackBody): Promise<{ success: boolean }> {
  const res = await fetch(`${BASE_URL}/api/jarbees/feedback`, {
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
  const res = await fetch(`${BASE_URL}/api/jarbees/planner`, {
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
  titulo: string;
  autor?: string;
  formato: string;
  archivo?: string;
  categorias?: string[];
  embeddings?: string;
};

const FALLBACK_TITLES: { titulo: string; autor?: string }[] = [
  { titulo: "Los Nueve Ritos del Munay-Ki", autor: "Tradici�n Q'ero / Alberto Villoldo" },
  { titulo: "Herbario y Plantas Medicinales", autor: "Recopilaci�n propia" },
  { titulo: "Sanaciones Populares y Oraciones Curativas", autor: "Tradici�n popular regional" },
  { titulo: "Angeles Arrien Las Cuatro Sendas del Chaman", autor: "Desconocido" },
  { titulo: "The Etheric Double: The Health Aura of Man", autor: "Arthur E. Powell" },
  { titulo: "aventuras fuera del cuerpo buhlman william", autor: "Desconocido" },
  { titulo: "Biodescodificacion", autor: "Desconocido" },
  { titulo: "Arquetipos EI inconsciente Colectivo 1", autor: "Carl Gustav Jung" },
  { titulo: "Arquetipos EI inconsciente Colectivo 2", autor: "Carl Gustav Jung" },
  { titulo: "Arquetipos EI inconsciente Colectivo 3", autor: "Carl Gustav Jung" },
  { titulo: "Conflictos Del Alma Infantil", autor: "Carl Gustav Jung" },
  { titulo: "El hombre y sus simbolos", autor: "Carl Gustav Jung" },
  { titulo: "Energetica Psiquica y Esencia Del Sue�o", autor: "Carl Gustav Jung" },
  { titulo: "La Interpretacion De La Naturaleza Y La Psique", autor: "Carl Gustav Jung" },
  { titulo: "La Psicologia De La Transferencia 1", autor: "Carl Gustav Jung" },
  { titulo: "La Psicologia De La Transferencia 2", autor: "Carl Gustav Jung" },
  { titulo: "Los Complejos y el Inconsciente", autor: "Carl Gustav Jung" },
  { titulo: "Recuerdos Sue�os Pensamientos", autor: "Carl Gustav Jung" },
  { titulo: "Tipos Psicologicos Tomo 1", autor: "Carl Gustav Jung" },
  { titulo: "Tipos Psicologicos Tomo 2", autor: "Carl Gustav Jung" },
  { titulo: "Carta astral Ignacio Gabriel Fernandez", autor: "Desconocido" },
  { titulo: "Charles Fort El Libro de los Condenados", autor: "Desconocido" },
  { titulo: "COSMETICA NATURAL", autor: "Desconocido" },
  { titulo: "Cromoterapia: Curaci�n por los Colores", autor: "Medicina Alternativa" },
  { titulo: "El Sutra de las Cuarenta y Dos Secciones", autor: "Buda Gautama (Traducci�n)" },
  { titulo: "Curso B�sico AutoDefensa Ps�quica (1 de 2)", autor: "Desconocido" },
  { titulo: "Curso B�sico AutoDefensa Ps�quica (2 de 2)", autor: "Desconocido" },
  { titulo: "La Doctrina Secreta", autor: "Helena Petrovna Blavatsky" },
  { titulo: "El Uso Magico Del Tabaco En Un Contexto Urbano Lima", autor: "Desconocido" },
  { titulo: "Eliphas Levi Claves mayores y claviculas de Salomon", autor: "Desconocido" },
  { titulo: "El monte nos da comida", autor: "Desconocido" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n ", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 1", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 2", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 3", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 4", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 5", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 6", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 7", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 8", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 9", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 10", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 11", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 12", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 13", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 13", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 14", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 15", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 16", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 17", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 18", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 19", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 20", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 21", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 22", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 23", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 24", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 25", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 26", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 27", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 28", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 29", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 30", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 31", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 32", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 33", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 34", autor: "Al Filo de la Realidad" },
  { titulo: "Curso de Esoterismo Pr�ctico - Lecci�n 35", autor: "Al Filo de la Realidad" },
  { titulo: "Existen los Hechizos y Maleficios", autor: "Desconocido" },
  { titulo: "Fundamentos Racionales de la Astrolog�a", autor: "Desconocido" },
  { titulo: "Hacking Taller Attacking AD", autor: "Desconocido" },
  { titulo: "Hermes El Kybalion", autor: "Desconocido" },
  { titulo: "Hierbas info pap�s Alan", autor: "Desconocido" },
  { titulo: "�caros: Cantos Sagrados del Amazonas", autor: "Tradici�n Amaz�nica" },
  { titulo: "Tintes Naturales de Plantas Nativas: Colores de la Patagonia", autor: "INTA" },
  { titulo: "Cantos de ignorancia iluminada", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "Curaciones Chamanicas", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "El Cerebro Consciente", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "El poder curativo de la mente Tulku Thondup", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "El Potencial Transferido", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "El Sabor de la Iluminacion 1994", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "El Vehiculo de las Transformaciones", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "Fluir en El sin yo by", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "La conquista del templo", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "La Construccion de La Realidad", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "La Experiencia interna", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "La Fuerza Creativa del Amor", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "La fuerza vital del cielo anterior", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "La percepcion de la realidad", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "La Real Tecnologia", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "La teoria sintergica", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "Las Manifestaciones Del Ser Pachita", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "Los Chamanes de Mexico El Cerebro y los Chamanes Vol 5 2", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "Los Chamanes de Mexico PACHITA Vol 3", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "Los Chamanes de Mexico Vol 1", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "Los Chamanes de Mexico Vol 2", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "Los Chamanes de Mexico Vol 4", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "Los Chamanes de Mexico Vol 6", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "Los Chamanes de Mexico Vol 7", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "Los Cristales de la Galaxia", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "Mas Alla de los Lenguajes", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "MEDITACION AUTOALUSIVA", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "Misticismo indigena by", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "Retorno a la Luz", autor: "Jacobo Grinberg-Zylberbaum" },
  { titulo: "LA HISTORIA DEL TIEMPO", autor: "Desconocido" },
  { titulo: "La V�a del Tarot", autor: "Alejandro Jodorowsky & Marianne Costa" },
  { titulo: "La Cocina Vegetariana de Hare Krishna", autor: "Adiraja Dasa" },
  { titulo: "las mareas del inconsciente.docx", autor: "Desconocido" },
  { titulo: "Teoamoxtli: Libro de Esencia Divina", autor: "Tradici�n Tolteca" },
  { titulo: "lista completa de patentes de nikola tesla", autor: "Desconocido" },
  { titulo: "Malezas Comestibles Del Cono Sur", autor: "Desconocido" },
  { titulo: "MANUAL SANACIONES POPULARES", autor: "Desconocido" },
  { titulo: "Mas alla del ego Walsh", autor: "Desconocido" },
  { titulo: "Munay Ki Apunte", autor: "Desconocido" },
  { titulo: "Munay Ki ESPACIO SAGRADO", autor: "Desconocido" },
  { titulo: "Munay ki", autor: "Desconocido" },
  { titulo: "Nikola Tesla Illustrated Autobiography", autor: "Desconocido" },
  { titulo: "Oracion.docx", autor: "Desconocido" },
  { titulo: "pim van lommel consciencia mas alla de la vida la ciencia de la experiencia cercana a la muerte", autor: "Desconocido" },
  { titulo: "Plantas medicinales del nordeste argentino incupo", autor: "Desconocido" },
  { titulo: "Popol Vuh: El Libro Sagrado de los Mayas", autor: "Tradici�n K'iche'" },
  { titulo: "Shamans Priests and Witches A Cross Cultural Study of Magico Religious Practitioners", autor: "Desconocido" },
  { titulo: "SIGNIFICADO DE LAS 22 LETRAS DEL ALFABETO HEBREO", autor: "Desconocido" },
  { titulo: "telektonon", autor: "Desconocido" },
  { titulo: "telektonon manual", autor: "Desconocido" },
  { titulo: "Nikola Tesla: Energa Libre y Antigravedad", autor: "Nikola Tesla / Recopilacin" },
  { titulo: "tintes naturales maya mesoamerica etnobotanica codice artesania prehispanico colonial tzutujil", autor: "Desconocido" },
  { titulo: "Un Ensueo entre Serpientes y Jaguares (Parte 1)", autor: "Tradicin Chamnica / Relatos" },
  { titulo: "Un Ensueo entre Serpientes y Jaguares (Parte 2)", autor: "Tradicin Chamnica / Relatos" }
];

export async function getLibraryIndex(): Promise<LibraryIndexItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/jarbees/library/index`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (res.ok) {
      const data = await res.json();
      let list: unknown[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && typeof data === "object") {
        list = (data as Record<string, unknown>).documentos as unknown[] ?? (data as Record<string, unknown>).documents as unknown[] ?? [];
      }
      if (Array.isArray(list) && list.length > 0) {
        return list as LibraryIndexItem[];
      }
    }
  } catch (error) {
    console.warn("No se pudo cargar el índice de forma dinámica desde el backend, usando fallback estático:", error);
  }

  // Fallback con el listado estático si hay errores de red, CORS, o mixed content
  return FALLBACK_TITLES.map((item) => ({
    titulo: item.titulo,
    autor: item.autor,
    formato: "pdf",
  }));
}

export function connectGoogle(): void {
  if (typeof window === "undefined") return;
  window.location.assign(`${BASE_URL}/api/jarbees/google/login`);
}

const jarbeesApi = { ingestUrl, sendFeedback, createPlanner, connectGoogle, getLibraryIndex };

export default jarbeesApi;
