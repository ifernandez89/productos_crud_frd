// src/app/products/[id]/edit/page.tsx
import ProductDetailContainer from "@/components/products/ProductDetailsContainer";
import { getProduct } from "@/app/services/products.api";

type ProductParams = {
  params: {
    id: string;
  };
};

export default async function ProductEditPage(props: Readonly<ProductParams>) {
  const params = await props.params;
  let product = null;
  if (!params?.id) {
    throw new Error("ID del producto no proporcionado.");
  } else {
    product = await getProduct(params.id);
  }

  return <ProductDetailContainer title="Detalles" product={product} />;
}
