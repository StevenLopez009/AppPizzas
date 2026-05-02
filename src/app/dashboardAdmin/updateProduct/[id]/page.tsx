import { notFound } from "next/navigation";
import { getProduct } from "@/lib/repos/products";
import ProductUpdate from "./ProductUpdate";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return notFound();
  return <ProductUpdate product={product} />;
}
