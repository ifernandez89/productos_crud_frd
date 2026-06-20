"use client";

import React, { useEffect, useState } from "react";
import ProductFormContainer from "@/components/forms/ProductFormContainer";
import { getProduct } from "@/app/services/products.api";
import { Product } from "@/components/products/models/Product";

type PageProps = { params?: { id?: string } };

export default function ProductEditPage(props: PageProps) {
  const params = props?.params || {};
  const id = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "no-id">("loading");

  useEffect(() => {
    if (!id) {
      setStatus("no-id");
      return;
    }
    let mounted = true;
    setStatus("loading");
    getProduct(id)
      .then((p) => {
        if (!mounted) return;
        setProduct(p as Product);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        console.error("Client fetch product error:", err);
        if (!mounted) return;
        setStatus("error");
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (status === "loading") return <div className="p-6">Cargando producto…</div>;
  if (status === "no-id") return <div className="p-6">ID no proporcionado.</div>;
  if (status === "error") return <div className="p-6">JarBees desconectado — no se puede cargar el producto.</div>;

  return (
    <div className="max-w-xl mx-auto mt-8">
      <ProductFormContainer title="Editar producto" product={product} />
    </div>
  );
}
