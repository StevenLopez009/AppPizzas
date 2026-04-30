import { createClient } from "@/lib/supabase/client";

export async function uploadBanner(file: File) {
  const supabase = createClient();

  const fileName = `${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("banners")
    .upload(fileName, file);

  console.log("UPLOAD DATA:", data);
  console.log("UPLOAD ERROR:", error);

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("banners").getPublicUrl(fileName);

  return publicUrl;
}
