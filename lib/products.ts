import { createClient } from "./supabase/client";

export async function getProducts() {
  const supabase = createClient();

  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    console.log(error);
    return [];
  }

  return data;
}
