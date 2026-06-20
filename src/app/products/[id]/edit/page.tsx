import { getProduct } from "../../../services/products.api";
import ProductFormContainer from "@/components/forms/ProductFormContainer";

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
  const ids = process.env.NEXT_PUBLIC_STATIC_PRODUCT_IDS;
  if (!ids) return [];
  return ids.split(',').map((id) => ({ id: id.trim() }));
}
