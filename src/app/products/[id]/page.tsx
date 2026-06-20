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

// For `output: 'export'` we must provide `generateStaticParams` for dynamic routes.
// By default we export no product pages. To export specific products at build
// time, set the environment variable `NEXT_PUBLIC_STATIC_PRODUCT_IDS="id1,id2"`.
export async function generateStaticParams() {
  const ids = process.env.NEXT_PUBLIC_STATIC_PRODUCT_IDS;
  if (!ids) return [];
  return ids.split(',').map((id) => ({ id: id.trim() }));
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
