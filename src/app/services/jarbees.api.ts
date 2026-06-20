export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BASE_URL = BACKEND_URL ?? "http://localhost:4000";
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

const buildHeaders = (hasJson = false) => {
  const headers: Record<string, string> = {};
  if (hasJson) headers["Content-Type"] = "application/json";
  if (API_TOKEN) headers["Authorization"] = `Bearer ${API_TOKEN}`;
  return headers;
};

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

const jarbeesApi = { ingestUrl, sendFeedback, createPlanner };

export default jarbeesApi;
