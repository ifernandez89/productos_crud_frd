"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente a la página de chat
    router.replace("/preguntas/new");
  }, [router]);

  // Mostrar mensaje mientras redirige
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        <p className="text-slate-400">Cargando JarBees...</p>
      </div>
    </div>
  );
}

export default HomePage;
