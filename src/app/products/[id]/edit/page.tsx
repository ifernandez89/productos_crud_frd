import { getProduct } from "../../../services/products.api";
import ProductFormContainer from "@/components/forms/ProductFormContainer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ProductEditPage(props: any) {
  const params = await props.params;
  const id = params?.id;
  const product = await getProduct(id);

  return (
    <div className="max-w-xl mx-auto mt-8">
      <ProductFormContainer title="Editar producto" product={product} />
    </div>
  );
}

export default ProductEditPage;

// Provide static params for export; empty by default. Set
// `NEXT_PUBLIC_STATIC_PRODUCT_IDS` to a comma-separated list to export product pages.
export async function generateStaticParams() {
  try {
    const { getProducts } = await import('@/app/services/products.api');
    const products = await getProducts();
    if (Array.isArray(products) && products.length > 0) {
      return products.map((p: any) => ({ id: String(p.id || p._id || p.slug) }));
    }
  } catch (e) {
    // ignore and fallback
  }

  const ids = process.env.NEXT_PUBLIC_STATIC_PRODUCT_IDS;
  if (!ids) return [];
  return ids.split(',').map((id) => ({ id: id.trim() }));
}
