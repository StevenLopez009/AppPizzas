"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface Banner {
  id: string;
  image_url: string;
}

export default function AdminBanner() {
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);

  async function getBanners() {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBanners(data);
    }
  }

  useEffect(() => {
    getBanners();
  }, []);

  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);

      const fileName = `${Date.now()}-${file.name}`;

      // subir imagen
      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(fileName, file);

      if (uploadError) {
        console.error(uploadError);
        return;
      }

      // obtener url pública
      const { data: publicUrlData } = supabase.storage
        .from("banners")
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      // guardar en tabla
      const { error } = await supabase.from("banners").insert([
        {
          image_url: imageUrl,
        },
      ]);

      if (error) {
        console.error(error);
        return;
      }

      setFile(null);

      await getBanners();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  async function handleDelete(id: string) {
    const { error } = await supabase.from("banners").delete().eq("id", id);

    if (!error) {
      setBanners((prev) => prev.filter((banner) => banner.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow">
        <h2 className="text-2xl font-bold mb-4">Administrar banners</h2>

        <input type="file" accept="image/*" onChange={handleFileChange} />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="mt-4 bg-orange-500 text-white px-5 py-2 rounded-xl"
        >
          {loading ? "Subiendo..." : "Subir banner"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="relative h-40 rounded-2xl overflow-hidden"
          >
            <Image
              src={banner.image_url}
              alt="banner"
              fill
              className="object-cover"
            />

            <button
              onClick={() => handleDelete(banner.id)}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-xl"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
