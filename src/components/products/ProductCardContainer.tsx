"use client";

import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/products/ProductCardPresentational";

export function ProductCardContainer({ product }: Readonly<{ product: any }>) {
  const router = useRouter();

  const handleView = () => {
    router.push(`/products/${product.id}`);
  };

  return (
    <ProductCard
      product={product}
      onView={handleView}
    />
  );
}
