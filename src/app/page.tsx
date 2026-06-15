import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { getProducts } from "./services/products.api";
import { ProductListContainer } from "../components/products/ProductListContainer";

export const dynamic = "force-dynamic";

async function HomePage() {
  const products = await getProducts();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-8 text-white shadow-2xl shadow-slate-200/40 md:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                fill="currentColor"
                className="mr-3 inline-block h-10 w-10 align-middle text-cyan-300 transition-transform hover:scale-110"
              >
                <path d="M8 24v28c0 1.1.9 2 2 2h10V40c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v14h20c1.1 0 2-.9 2-2V24H8zM26 52V42h8v10h-8z" />
                <path d="M56 22h-2V12c0-1.1-.9-2-2-2H12c-1.1 0-2 .9-2 2v10H8c-1.1 0-2 .9-2 2s.9 2 2 2h48c1.1 0 2-.9 2-2s-.9-2-2-2zM50 22H14V14h36v8z" />
                <circle cx="18" cy="28" r="2" />
                <circle cx="26" cy="28" r="2" />
                <circle cx="34" cy="28" r="2" />
                <circle cx="42" cy="28" r="2" />
                <circle cx="50" cy="28" r="2" />
              </svg>
              NextStore
            </h1>
            <p className="max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              Arrancá por productos, abrí el chat con IA o entrá directo a las acciones rápidas para clima, feriados, hora local y países.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className={`${buttonVariants()} bg-cyan-400 text-slate-950 hover:bg-cyan-300`} href="/products/new">
              Productos
            </Link>
            <Link className={`${buttonVariants()} border border-white/20 bg-white/10 text-white hover:bg-white/20`} href="/preguntas/new">
              Chat con IA
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link
            href="/products/new"
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition-transform hover:-translate-y-1 hover:bg-white/10"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">01</p>
            <h2 className="mt-3 text-xl font-semibold">Productos</h2>
            <p className="mt-2 text-sm text-slate-300">
              Cargar, editar y explorar el catálogo desde el flujo principal.
            </p>
          </Link>
          <Link
            href="/preguntas/new"
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition-transform hover:-translate-y-1 hover:bg-white/10"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">02</p>
            <h2 className="mt-3 text-xl font-semibold">Chat con IA</h2>
            <p className="mt-2 text-sm text-slate-300">
              Consultá con voz, texto y navegación por historial de preguntas.
            </p>
          </Link>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">03</p>
            <h2 className="mt-3 text-xl font-semibold">Acciones rápidas</h2>
            <p className="mt-2 text-sm text-slate-300">
              Clima, feriados de Argentina, hora local y datos de países.
            </p>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2 px-1">
        <Link className={buttonVariants()} href="/products/new">
          Add Product
        </Link>
        <Link className={buttonVariants()} href="/preguntas/new">
          Questions?
        </Link>
      </div>

      <ProductListContainer products={products} />
    </div>
  );
}

export default HomePage;
