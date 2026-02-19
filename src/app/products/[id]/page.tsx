import { Metadata } from "next";
import ProductDetailContainer from "@/components/products/ProductDetailsContainer";
import { getProduct } from "@/app/services/products.api";

type ProductParams = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  props: ProductParams
): Promise<Metadata> {
  const params = await props.params;
  const product = await getProduct(params.id);
  
  return {
    title: product ? `${product.name} - NextStore` : "Product Not Found",
    description: product?.description || "Product details page",
  };
}

export default async function ProductEditPage(props: ProductParams) {
  const params = await props.params;
  let product = null;
  if (!params?.id) {
    throw new Error("ID del producto no proporcionado.");
  } else {
    product = await getProduct(params.id);
  }

  return <ProductDetailContainer title="Detalles" product={product} />;
}
