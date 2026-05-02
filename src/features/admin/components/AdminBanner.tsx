"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { uploadImageToCloudinary } from "@/lib/storage/cloudinary";
import {
  createBanner,
  deleteBanner,
  getBanners,
  type Banner,
} from "@/src/features/banner/services/banner.service";

export default function AdminBanner() {
  const [file, setFile] = useState<File | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setLoading(true);
      const url = await uploadImageToCloudinary(file);
      await createBanner(url);
      setFile(null);
      toast.success("Banner subido");
      await refresh();
    } catch (e) {
      console.error(e);
      toast.error("Error subiendo banner");
    } finally {
      setLoading(false);
    }
  };

  async function handleDelete(id: string) {
    try {
      await deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success("Banner eliminado");
    } catch (e) {
      console.error(e);
      toast.error("Error eliminando banner");
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
          className="mt-4 bg-brand text-white px-5 py-2 rounded-xl"
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
