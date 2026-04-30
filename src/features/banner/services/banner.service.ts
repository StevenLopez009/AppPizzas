import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function getBanners() {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function createBanner(image_url: string) {
  const { data, error } = await supabase
    .from("banners")
    .insert([{ image_url }])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteBanner(id: string) {
  const { error } = await supabase.from("banners").delete().eq("id", id);

  if (error) throw error;
}
