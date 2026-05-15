import { notFound } from "next/navigation";
import ProductDetailPage from "@/src/features/products/pages/ProductDetailPage";
import { getProduct } from "@/lib/repos/products";
import { listAdditionals } from "@/lib/repos/additionals";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  const product = await getProduct(id);
  if (!product) return notFound();

  const additionals = await listAdditionals({
    category_id: product.category_id ?? undefined,
    onlyActive: true,
  });

  console.log("Product category_id:", product.category_id);
  console.log("Additionals found:", additionals.length);

  return <ProductDetailPage product={product} additionals={additionals} />;
}
