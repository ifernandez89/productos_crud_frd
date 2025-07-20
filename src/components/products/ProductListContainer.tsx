"use client";

import { ProductCardContainer } from "./ProductCardContainer";

export function ProductListContainer({ products }: Readonly<{ products: any[] }>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCardContainer key={product.id} product={product} />
      ))}
    </div>
  );
}
