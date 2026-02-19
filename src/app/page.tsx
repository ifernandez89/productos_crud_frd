import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { getProducts } from "./services/products.api";
import { ProductListContainer } from "../components/products/ProductListContainer";

export const dynamic = "force-dynamic";

async function HomePage() {
  const products = await getProducts();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          fill="currentColor"
          className="w-8 h-8 inline-block mr-2 hover:scale-110 transition-transform text-zinc-950"
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
      <div className="flex justify-end px-6 pb-10">
        <Link className={`${buttonVariants()} mr-2`} href="/products/new">
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
