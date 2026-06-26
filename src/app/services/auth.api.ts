// app/services/auth.api.ts

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
const TOKEN_KEY = "jarbees_auth_token";

export type LoginCredentials = {
  username: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  expiresIn?: string;
};

// ─── localStorage helpers ─────────────────────────────────────────────────────
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

export const storeToken = (token: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
};

// ─── Headers con JWT ─────────────────────────────────────────────────────────
export const buildAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// ─── Login ────────────────────────────────────────────────────────────────────
/**
 * POST /auth/login
 * Obtiene el token JWT del backend
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(errorBody || "Error al iniciar sesión");
    }

    const data = (await res.json()) as AuthResponse;
    storeToken(data.token);
    return data;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Error desconocido al iniciar sesión");
  }
}

// ─── Verify ───────────────────────────────────────────────────────────────────
/**
 * GET /auth/verify
 * Verifica si el token actual es válido
 */
export async function verifyToken(): Promise<boolean> {
  try {
    const token = getToken();
    if (!token) return false;

    const res = await fetch(`${BASE_URL}/auth/verify`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    return res.ok;
  } catch {
    return false;
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export function logout() {
  clearToken();
  // Opcionalmente: limpiar sessionId también
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("jarbees_session_id");
  }
}

// ─── Check si está autenticado ────────────────────────────────────────────────
export async function isAuthenticated(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  return await verifyToken();
}
