import { createClient } from "@/lib/supabase/client";
import ProductUpdate from "./ProductUpdate";
import { notFound } from "next/navigation";

export default async function Page({
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

  return <ProductUpdate product={product} />;
}
