import { notFound } from "next/navigation";

import ProductUI from "./ProductUi";
import { createClient } from "@/lib/supabase/client";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) return notFound();

  return <ProductUI product={product} />;
}
