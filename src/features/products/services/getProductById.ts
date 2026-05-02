import { createClient } from "@/lib/supabase/client";

export async function getProductById(id: string) {
  const supabase = createClient();

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  return data;
}
