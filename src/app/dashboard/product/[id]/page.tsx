import { notFound } from "next/navigation";
import ProductDetailPage from "@/src/features/products/pages/ProductDetailPage";
import { getProduct } from "@/lib/repos/products";
import { listAdditionals } from "@/lib/repos/additionals";

interface Props {
  params: Promise<{ id: string }>;
}

function mapCategoryForAdditionals(category: string | null): string | null {
  if (!category) return null;
  const normalized = category.toLowerCase();
  if (normalized.includes("pizza")) return "pizza";
  if (normalized.includes("lasagna") || normalized.includes("lasaña"))
    return "lasagna";
  if (normalized.includes("rapida") || normalized.includes("com"))
    return "Com. Rapidas";
  return null;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  const product = await getProduct(id);
  if (!product) return notFound();

  const additionalsCategory = mapCategoryForAdditionals(product.category);
  const additionals = additionalsCategory
    ? await listAdditionals({
        category: additionalsCategory,
        onlyActive: true,
      })
    : [];

  return <ProductDetailPage product={product} additionals={additionals} />;
}
