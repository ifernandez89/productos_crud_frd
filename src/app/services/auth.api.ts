// app/services/auth.api.ts

export const AUTH_CHANGED_EVENT = "jarbees:auth-changed";
export const AUTH_REQUIRED_EVENT = "jarbees:auth-required";
export const OPEN_LOGIN_EVENT = "jarbees:open-login";

const TOKEN_STORAGE_KEY = "jarbees_access_token";
const OPERATOR_STORAGE_KEY = "jarbees_operator_id";
const LAST_OPERATOR_STORAGE_KEY = "jarbees_last_operator_id";
const BACKEND_OVERRIDE_KEY = "jarbees_backend_url";

export interface AuthSession {
  token: string | null;
  operatorId: string | null;
  isAuthenticated: boolean;
}

export interface OperatorLoginResponse {
  access_token: string;
  expires_in?: string;
  operatorId: string;
  role?: string;
  scopes?: string[];
}

let inMemoryToken: string | null = null;
let inMemoryOperatorId: string | null = null;

export const normalizeBaseUrl = (url?: string | null): string =>
  (url ?? "").trim().replace(/\/+$/, "");

export function resolveBackendBaseUrl(): string {
  if (typeof window !== "undefined") {
    const customUrl = normalizeBaseUrl(window.localStorage.getItem(BACKEND_OVERRIDE_KEY));
    if (customUrl) return customUrl;
  }
  const envUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_BACKEND_URL);
  return envUrl || "http://localhost:4000";
}

export function setCustomBackendUrl(url?: string | null): void {
  if (typeof window === "undefined") return;
  const clean = normalizeBaseUrl(url);
  if (clean) {
    window.localStorage.setItem(BACKEND_OVERRIDE_KEY, clean);
  } else {
    window.localStorage.removeItem(BACKEND_OVERRIDE_KEY);
  }
}

export function getCustomBackendUrl(): string {
  if (typeof window === "undefined") return "";
  return normalizeBaseUrl(window.localStorage.getItem(BACKEND_OVERRIDE_KEY));
}

export function getStoredAuthToken(): string | null {
  if (typeof window !== "undefined") {
    try {
      const sessionToken = window.sessionStorage.getItem(TOKEN_STORAGE_KEY)?.trim();
      if (sessionToken) {
        inMemoryToken = sessionToken;
        return sessionToken;
      }
    } catch {
      // Fallback to in-memory cache if sessionStorage is unavailable
    }
  }
  if (inMemoryToken) return inMemoryToken;

  const fallbackToken = (process.env.NEXT_PUBLIC_API_TOKEN ?? "").trim();
  return fallbackToken || null;
}

export function getStoredOperatorId(): string | null {
  if (typeof window !== "undefined") {
    try {
      const storedOp = window.sessionStorage.getItem(OPERATOR_STORAGE_KEY)?.trim();
      if (storedOp) {
        inMemoryOperatorId = storedOp;
        return storedOp;
      }
    } catch {
      // ignore
    }
  }
  return inMemoryOperatorId;
}

export function getLastOperatorId(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(LAST_OPERATOR_STORAGE_KEY)?.trim() || "";
  } catch {
    return "";
  }
}

export function getAuthSession(): AuthSession {
  const token = getStoredAuthToken();
  const operatorId = getStoredOperatorId();
  return {
    token,
    operatorId,
    isAuthenticated: Boolean(token),
  };
}

function dispatchAuthEvent(name: string, detail?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function setAuthSession(token: string, operatorId: string): void {
  const cleanToken = token.trim();
  const cleanOperator = operatorId.trim();
  inMemoryToken = cleanToken;
  inMemoryOperatorId = cleanOperator;

  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, cleanToken);
      window.sessionStorage.setItem(OPERATOR_STORAGE_KEY, cleanOperator);
      window.localStorage.setItem(LAST_OPERATOR_STORAGE_KEY, cleanOperator);
    } catch {
      // ignore storage quota errors
    }
  }
  dispatchAuthEvent(AUTH_CHANGED_EVENT, { authenticated: true, operatorId: cleanOperator });
}

export function clearAuthSession(): void {
  inMemoryToken = null;
  inMemoryOperatorId = null;

  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      window.sessionStorage.removeItem(OPERATOR_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  dispatchAuthEvent(AUTH_CHANGED_EVENT, { authenticated: false, operatorId: null });
}

export function openOperatorLoginModal(reason?: string): void {
  dispatchAuthEvent(OPEN_LOGIN_EVENT, reason ? { reason } : undefined);
}

export function handleUnauthorizedResponse(res: Response, customReason?: string): void {
  if (res.status !== 401) return;
  const hadSession = Boolean(getStoredAuthToken());
  if (hadSession) {
    clearAuthSession();
  }
  dispatchAuthEvent(AUTH_REQUIRED_EVENT, {
    reason:
      customReason ||
      (hadSession
        ? "Tu sesión expiró o dejó de ser válida. Volvé a iniciar sesión."
        : "Este endpoint requiere iniciar sesión como operador."),
  });
}

export function buildBackendHeaders(options?: {
  json?: boolean;
  accept?: boolean;
  targetUrl?: string;
  includeAuth?: boolean;
}): Record<string, string> {
  const headers: Record<string, string> = {};
  if (options?.json) headers["Content-Type"] = "application/json";
  if (options?.accept) headers["Accept"] = "application/json";

  const target = options?.targetUrl || resolveBackendBaseUrl();
  if (target.includes("ngrok")) {
    headers["ngrok-skip-browser-warning"] = "69420";
  }

  if (options?.includeAuth !== false) {
    const token = getStoredAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

export async function loginOperator(
  operatorId: string,
  password: string,
  targetBaseUrl?: string
): Promise<OperatorLoginResponse> {
  const cleanOperatorId = operatorId.trim();
  if (!/^[a-zA-Z0-9._-]{3,64}$/.test(cleanOperatorId)) {
    throw new Error(
      "El operatorId debe tener entre 3 y 64 caracteres (letras, números, '.', '_' o '-')."
    );
  }
  if (!password) {
    throw new Error("Ingresá la contraseña del operador.");
  }

  const baseUrl = normalizeBaseUrl(targetBaseUrl) || resolveBackendBaseUrl();
  const loginUrl = `${baseUrl}/api/auth/login`;

  const res = await fetch(loginUrl, {
    method: "POST",
    headers: buildBackendHeaders({
      json: true,
      accept: true,
      targetUrl: loginUrl,
      includeAuth: false,
    }),
    body: JSON.stringify({
      operatorId: cleanOperatorId,
      password,
    }),
  });

  if (!res.ok) {
    let backendMessage = "";
    try {
      const errJson = (await res.json()) as { message?: string | string[] };
      backendMessage = Array.isArray(errJson?.message)
        ? errJson.message.join(" ")
        : errJson?.message || "";
    } catch {
      backendMessage = await res.text().catch(() => "");
    }

    if (res.status === 429) {
      throw new Error(
        backendMessage ||
          "Demasiados intentos de inicio de sesión (bloqueo temporal activo). Esperá unos minutos e intentá nuevamente."
      );
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        backendMessage ||
          "Credenciales rechazadas (401). Verificá operatorId, contraseña o que MASTER_PASSWORD_HASH esté configurado en el backend."
      );
    }
    throw new Error(
      backendMessage || `Error al iniciar sesión (${res.status}).`
    );
  }

  const data = (await res.json()) as OperatorLoginResponse;
  if (!data?.access_token) {
    throw new Error("El backend no devolvió access_token en /api/auth/login.");
  }

  if (normalizeBaseUrl(targetBaseUrl)) {
    setCustomBackendUrl(targetBaseUrl);
  }
  setAuthSession(data.access_token, data.operatorId || cleanOperatorId);
  return data;
}

