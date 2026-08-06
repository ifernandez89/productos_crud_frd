"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const target = BASE_PATH ? `${BASE_PATH}/preguntas/new` : "/preguntas/new";
      router.replace(target);
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent shadow-lg shadow-cyan-500/20" />
        <p className="text-sm font-medium text-slate-300">Cargando JarBees...</p>
      </div>
    </div>
  );
}
