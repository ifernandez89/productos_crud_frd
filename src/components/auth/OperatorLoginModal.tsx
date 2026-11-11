"use client";

import { useEffect, useState } from "react";
import { Lock, LogOut, X } from "lucide-react";
import {
  AUTH_CHANGED_EVENT,
  AUTH_REQUIRED_EVENT,
  OPEN_LOGIN_EVENT,
  clearAuthSession,
  getAuthSession,
  getCustomBackendUrl,
  getLastOperatorId,
  loginOperator,
  resolveBackendBaseUrl,
  setCustomBackendUrl,
} from "@/app/services/auth.api";

export default function OperatorLoginModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [operatorId, setOperatorId] = useState("");
  const [password, setPassword] = useState("");
  const [backendUrl, setBackendUrl] = useState("");
  const [showAdvancedUrl, setShowAdvancedUrl] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sessionOperator, setSessionOperator] = useState<string | null>(null);

  useEffect(() => {
    const syncSession = () => {
      const s = getAuthSession();
      setSessionOperator(s.isAuthenticated ? s.operatorId : null);
    };

    const handleOpenRequest = (ev: Event) => {
      const detail = (ev as CustomEvent<{ reason?: string }>)?.detail;
      setOperatorId((prev) => prev || getLastOperatorId());
      setBackendUrl(getCustomBackendUrl() || resolveBackendBaseUrl());
      setReason(detail?.reason || null);
      setError(null);
      setPassword("");
      setIsOpen(true);
    };

    syncSession();
    window.addEventListener(AUTH_CHANGED_EVENT, syncSession);
    window.addEventListener(AUTH_REQUIRED_EVENT, handleOpenRequest);
    window.addEventListener(OPEN_LOGIN_EVENT, handleOpenRequest);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncSession);
      window.removeEventListener(AUTH_REQUIRED_EVENT, handleOpenRequest);
      window.removeEventListener(OPEN_LOGIN_EVENT, handleOpenRequest);
    };
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const trimmedUrl = backendUrl.trim().replace(/\/+$/, "");
      const defaultEnvUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "")
        .trim()
        .replace(/\/+$/, "");
      if (trimmedUrl && trimmedUrl !== (defaultEnvUrl || "http://localhost:4000")) {
        setCustomBackendUrl(trimmedUrl);
      } else {
        setCustomBackendUrl(null);
      }

      await loginOperator(operatorId, password, trimmedUrl || undefined);
      setPassword("");
      setReason(null);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setPassword("");
    setReason("Sesión cerrada correctamente.");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="jarbees-operator-login-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#141414] p-6 text-white shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/15 text-cyan-300">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="jarbees-operator-login-title"
                className="text-base font-semibold text-white"
              >
                Acceso de Operador JarBees
              </h2>
              <p className="text-xs text-[#9e9e9e]">
                Autenticación JWT contra /api/auth/login (Security Kernel B1)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPassword("");
              setIsOpen(false);
            }}
            className="rounded-lg p-1.5 text-[#9e9e9e] transition hover:bg-white/10 hover:text-white"
            aria-label="Cerrar diálogo de acceso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {sessionOperator && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
            <span>
              Sesión activa como <strong>{sessionOperator}</strong>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 px-2 py-1 text-[11px] font-medium hover:bg-emerald-500/20"
            >
              <LogOut className="h-3 w-3" />
              Salir
            </button>
          </div>
        )}

        {reason && (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            {reason}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/15 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="jarbees-operator-id"
              className="mb-1.5 block text-xs font-medium text-[#d4d4d4]"
            >
              Operator ID nominal
            </label>
            <input
              id="jarbees-operator-id"
              type="text"
              autoComplete="username"
              required
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              placeholder="Ej: ignacio"
              className="w-full rounded-xl border border-white/[0.12] bg-[#0c0c0c] px-3 py-2 text-sm text-white placeholder-[#666] focus:border-cyan-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-[#7c7c7c]">
              3–64 caracteres (no uses IDs genéricos como owner, root o admin).
            </p>
          </div>

          <div>
            <label
              htmlFor="jarbees-operator-password"
              className="mb-1.5 block text-xs font-medium text-[#d4d4d4]"
            >
              Contraseña de operador
            </label>
            <input
              id="jarbees-operator-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-white/[0.12] bg-[#0c0c0c] px-3 py-2 text-sm text-white placeholder-[#666] focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvancedUrl((prev) => !prev)}
              className="text-[11px] text-cyan-400 hover:underline"
            >
              {showAdvancedUrl
                ? "Ocultar URL del backend"
                : "Configurar URL del backend (ngrok / localhost)"}
            </button>
            {showAdvancedUrl && (
              <div className="mt-2">
                <input
                  type="url"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="https://tu-subdominio.ngrok-free.dev"
                  className="w-full rounded-xl border border-white/[0.12] bg-[#0c0c0c] px-3 py-2 font-mono text-xs text-white placeholder-[#666] focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setPassword("");
                setIsOpen(false);
              }}
              className="rounded-xl border border-white/[0.10] bg-[#1c1c1c] px-4 py-2 text-xs font-medium text-[#d4d4d4] transition hover:bg-[#262626]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#0078d7] px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#106ebe] disabled:opacity-50"
            >
              {submitting ? "Verificando..." : "Iniciar sesión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

