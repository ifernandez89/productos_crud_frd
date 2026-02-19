"use client";

import { ProductCardContainer } from "./ProductCardContainer";
import { Product } from "./models/Product";

export function ProductListContainer({ products }: Readonly<{ products: Product[] }>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCardContainer key={product.id} product={product} />
      ))}
    </div>
  );
}
