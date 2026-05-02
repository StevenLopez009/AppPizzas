import { createClient } from "@/lib/supabase/client";

export async function getAdditionals(category: string) {
  const supabase = createClient();

  let dbCategory = "";

  const normalized = category.toLowerCase();

  if (normalized.includes("pizza")) {
    dbCategory = "pizza";
  } else if (normalized.includes("lasagna") || normalized.includes("lasaña")) {
    dbCategory = "lasagna";
  } else if (normalized.includes("com")) {
    dbCategory = "Com. Rapidas";
  }

  if (!dbCategory) {
    return [];
  }

  const { data, error } = await supabase
    .from("additionals")
    .select("*")
    .eq("category", dbCategory)
    .eq("active", true);

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}
