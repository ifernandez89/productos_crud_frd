// app/services/auth.api.ts

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
const TOKEN_KEY = "jarbees_auth_token";
const MASTER_PASSWORD = process.env.NEXT_PUBLIC_MASTER_PASSWORD ?? "";

// ─── localStorage helpers ─────────────────────────────────────────────────────
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

export const storeToken = (token: string): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem("jarbees_session_id");
};

// ─── Headers con JWT ─────────────────────────────────────────────────────────
export const buildAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

// ─── Auto-login silencioso ────────────────────────────────────────────────────
/**
 * Obtiene un token JWT usando la MASTER_PASSWORD del .env.
 * Si ya hay un token en localStorage lo reutiliza directamente.
 * Se llama una vez al iniciar el chat y al recibir un 401.
 */
export async function autoLogin(): Promise<void> {
  // Reutilizar token existente sin verificar (evita una petición extra)
  const existing = getToken();
  if (existing) return;

  if (!MASTER_PASSWORD) return;

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: MASTER_PASSWORD }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { token?: string };
    if (data.token) storeToken(data.token);
  } catch {
    // backend caído — continuar sin token
  }
}
