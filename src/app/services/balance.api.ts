import {
  buildBackendHeaders,
  handleUnauthorizedResponse,
  resolveBackendBaseUrl,
} from "./auth.api";

const getBaseUrl = () => resolveBackendBaseUrl();

export interface BalanceQuestion {
  id: number;
  question: string;
}

export interface BalanceSessionResponse {
  sessionId: number;
  type: string;
  createdAt: string;
  questions: BalanceQuestion[];
}

export interface SubmitAnswerResponse {
  success: boolean;
  message: string;
  questionId: number;
  nextQuestion?: BalanceQuestion;
}

export interface BalanceReport {
  sessionId: number;
  completedAt: string;
  nextRecommendedAt?: string;
  type: string;
  scoreGeneral: number;
  summary: string;
  astrologicalContext?: unknown;
  energyDistribution: Record<string, number>;
  analysis: {
    fortalezas: string[];
    enCrecimiento: string[];
    necesitanAtencion: string[];
    loQueObservo: string;
    puntoCiego: string;
    fortalezaDetalle: string;
    astrologyConnection: string;
  };
  recommendations: {
    accionFocalizada: string;
    preguntaReflexion: string;
    semilla: string;
  };
  answers: Array<{
    id: number;
    question: string;
    answer: string;
    dimension: string;
  }>;
}

export async function startBalanceSession(type = "manual"): Promise<BalanceSessionResponse> {
  const url = `${getBaseUrl()}/api/balance/start`;
  const res = await fetch(url, {
    method: "POST",
    headers: buildBackendHeaders({ json: true, accept: true, targetUrl: url }),
    body: JSON.stringify({ type }),
  });
  if (!res.ok) {
    handleUnauthorizedResponse(res);
    throw new Error(`Error al iniciar balance (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

export async function submitBalanceAnswer(
  sessionId: number,
  questionId: number,
  answer: string
): Promise<SubmitAnswerResponse> {
  const url = `${getBaseUrl()}/api/balance/${sessionId}/answer`;
  const res = await fetch(url, {
    method: "POST",
    headers: buildBackendHeaders({ json: true, accept: true, targetUrl: url }),
    body: JSON.stringify({ questionId, answer }),
  });
  if (!res.ok) {
    handleUnauthorizedResponse(res);
    throw new Error(`Error al enviar respuesta (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

export async function finishBalanceSession(sessionId: number): Promise<BalanceReport> {
  const url = `${getBaseUrl()}/api/balance/${sessionId}/finish`;
  const res = await fetch(url, {
    method: "POST",
    headers: buildBackendHeaders({ json: true, accept: true, targetUrl: url }),
  });
  if (!res.ok) {
    handleUnauthorizedResponse(res);
    throw new Error(`Error al finalizar balance (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

export async function getLatestBalance(): Promise<BalanceReport | { message: string }> {
  const url = `${getBaseUrl()}/api/balance/latest`;
  const res = await fetch(url, {
    method: "GET",
    headers: buildBackendHeaders({ accept: true, targetUrl: url }),
  });
  if (!res.ok) {
    handleUnauthorizedResponse(res);
    throw new Error(`Error al obtener el último balance (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

export async function getBalanceHistory(): Promise<unknown[]> {
  const url = `${getBaseUrl()}/api/balance/history`;
  const res = await fetch(url, {
    method: "GET",
    headers: buildBackendHeaders({ accept: true, targetUrl: url }),
  });
  if (!res.ok) {
    handleUnauthorizedResponse(res);
    throw new Error(`Error al obtener historial de balances (${res.status}): ${await res.text()}`);
  }
  return res.json();
}
