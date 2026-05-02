import { notFound } from "next/navigation";
import ProductDetailPage from "@/src/features/products/pages/ProductDetailPage";
import { getProductById } from "@/src/features/products/services/getProductById";
import { getAdditionals } from "@/src/features/products/services/getAdditionals";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    return notFound();
  }

  const additionals = await getAdditionals(product.category);

  return (
    <>
      <ProductDetailPage product={product} additionals={additionals} />;
    </>
  );
}
