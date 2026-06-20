"use client";

import React, { useEffect, useState } from "react";
import ProductFormContainer from "@/components/forms/ProductFormContainer";
import { getProduct } from "@/app/services/products.api";
import { Product } from "@/components/products/models/Product";

// Accept either a params object or a Promise resolving to params to match
// Next's generated `PageProps` typing during build.
type PageProps = { params?: unknown };

function isPromise<T>(v: unknown): v is Promise<T> {
  return !!v && typeof (v as any).then === "function";
}

export default function ProductEditPage(props: PageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "no-id">("loading");

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setStatus("loading");
      const p = props?.params;
      let resolvedParams: { id?: string } | undefined;
      try {
        if (p === undefined) {
          setStatus("no-id");
          return;
        }
        if (isPromise<{ id?: string }>(p)) {
          resolvedParams = await p;
        } else {
          resolvedParams = p as { id?: string } | undefined;
        }
      } catch (err) {
        console.error("Error resolving params:", err);
        setStatus("no-id");
        return;
      }

      const id = resolvedParams?.id;
      if (!id) {
        setStatus("no-id");
        return;
      }

      try {
        const fetched = await getProduct(id);
        if (!mounted) return;
        setProduct(fetched as Product);
        setStatus("ready");
      } catch (err: unknown) {
        console.error("Client fetch product error:", err);
        if (!mounted) return;
        setStatus("error");
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [props]);

  if (status === "loading") return <div className="p-6">Cargando producto…</div>;
  if (status === "no-id") return <div className="p-6">ID no proporcionado.</div>;
  if (status === "error") return <div className="p-6">JarBees desconectado — no se puede cargar el producto.</div>;

  return (
    <div className="max-w-xl mx-auto mt-8">
      <ProductFormContainer title="Editar producto" product={product} />
    </div>
  );
}
