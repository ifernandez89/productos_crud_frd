import { getProduct } from "../../../services/products.api";
import ProductFormContainer from "@/components/forms/ProductFormContainer";

type PageProps = {
  params: Promise<{ id: string }>;
};


async function ProductEditPage(props: PageProps) {
  const { id } = await props.params;
  const product = await getProduct(id);

  return (
    <div className="max-w-xl mx-auto mt-8">
      <ProductFormContainer title="Editar producto" product={product} />
    </div>
  );
}

export default ProductEditPage;
