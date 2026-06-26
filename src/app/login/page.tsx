"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login, } from "@/app/services/auth.api";
import { useAuth } from "@/contexts/AuthContext";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Usuario y contraseña son requeridos");
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({ username: username.trim(), password: password.trim() });
      
      // El token ya se guardó en localStorage en la función login()
      // Actualizar el estado de autenticación
      auth.login(response.token);
      
      // Redirigir al chat
      router.push("/preguntas/new");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 p-4 shadow-lg shadow-cyan-500/20">
            <Image 
              src={`${BASE_PATH}/JarBees_logo.png`}
              alt="JarBees" 
              width={64} 
              height={64} 
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Bienvenido a JarBees</h1>
          <p className="mt-2 text-sm text-slate-400">Iniciá sesión para continuar</p>
        </div>

        {/* Formulario */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-300">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-100 placeholder-slate-500 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Tu usuario"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-100 placeholder-slate-500 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Tu contraseña"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

        {/* Info adicional */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Token JWT válido por 30 días</p>
          <p className="mt-1">Powered by JarBees AI Assistant</p>
        </div>
      </div>
    </div>
  );
}
