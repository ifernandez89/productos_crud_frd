import { getProduct } from "../../../services/products.api";
import ProductFormContainer from "@/components/forms/ProductFormContainer";

type PageProps = {
  params: { id: string };
};


async function ProductEditPage(props: Readonly<PageProps>) {
  const params = await props.params;
  const { id } = params;
  const product = await getProduct(id);

  return (
    <div className="max-w-xl mx-auto mt-8">
      <ProductFormContainer title="Editar producto" product={product} />
    </div>
  );
}

export default ProductEditPage;
