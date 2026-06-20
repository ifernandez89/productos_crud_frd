import ProductEditClient from "./ProductEditClient";

export async function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params?: Promise<{ id?: string }> | undefined }) {
  return <ProductEditClient params={params} />;
}
