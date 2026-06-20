import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";


function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-8 text-white shadow-lg md:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              JarBees
            </h1>
            <p className="max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              Tu asistente conversacional. Iniciá el chat con JarBees para pedir ayuda, generar texto, imágenes o buscar información.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className={`${buttonVariants()} bg-cyan-400 text-slate-950 hover:bg-cyan-300`} href="/preguntas/new">
              Abrir JarBees
            </Link>
            <Link className={`${buttonVariants()} border border-white/20 bg-white/10 text-white hover:bg-white/20`} href="/products/new">
              Catálogo (secundario)
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/preguntas/new"
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition-transform hover:-translate-y-1 hover:bg-white/10"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">01</p>
            <h2 className="mt-3 text-xl font-semibold">Chat con IA</h2>
            <p className="mt-2 text-sm text-slate-300">
              Iniciá una conversación con JarBees por voz o texto. Guardamos el historial localmente para continuar.
            </p>
          </Link>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">02</p>
            <h2 className="mt-3 text-xl font-semibold">Centro de Ayuda</h2>
            <p className="mt-2 text-sm text-slate-300">
              Centro de atención centrado en JarBees — sugerencias, preguntas frecuentes y documentación.
            </p>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2 px-1">
        <Link className={buttonVariants()} href="/preguntas/new">
          Iniciar chat
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
