"use client";
import { ChevronLeft, Pencil, Star } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { uploadImageToCloudinary } from "@/lib/storage/cloudinary";
import { api } from "@/lib/api";

export default function ProductUpdate({ product }: { product: any }) {
  const [title, setTitle] = useState(() => product?.name || "");
  const [description, setDescription] = useState(
    () => product?.description || "",
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editablePrices, setEditablePrices] = useState(
    () => product?.prices || [],
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const router = useRouter();

  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpdateProduct = async () => {
    try {
      let imageUrl = product.image_url;
      if (file) {
        imageUrl = await uploadImageToCloudinary(file);
      }

      await api.put(`/api/products/${encodeURIComponent(product.id)}`, {
        name: title,
        description,
        prices: editablePrices,
        image_url: imageUrl,
      });

      setIsEditing(false);
      setFile(null);
      setPreview(null);
      toast.success("Producto actualizado");
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error("Error actualizando producto");
    }
  };

  const handlePriceChange = (index: number, value: string) => {
    const updated = [...editablePrices];
    updated[index].price = Number(value);
    setEditablePrices(updated);
  };

  const handleDeleteProduct = async () => {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      await api.delete(`/api/products/${encodeURIComponent(product.id)}`);
      toast.success("Producto eliminado");
      router.push("/dashboardAdmin");
    } catch (e) {
      console.error(e);
      toast.error("Error al eliminar el producto");
    }
  };

  return (
    <div className="max-w-7xl mx-auto bg-white min-h-screen relative font-sans">
      <div className="md:grid md:grid-cols-2 md:gap-8 md:px-6 lg:px-8 md:pt-2">
        <div className="relative md:sticky md:h-[calc(100vh-3rem)] md:rounded-2xl md:overflow-hidden">
          <div className="relative h-[260px] w-full bg-gray-100 md:h-full md:min-h-[500px]">
            <Image
              src={preview || product.image_url || "/placeholder-pizza.jpg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />

            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <button
                onClick={() => router.back()}
                className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm active:scale-95 transition"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md"
              >
                <Pencil size={16} />
              </button>
            </div>

            {isEditing && (
              <div className="absolute bottom-4 left-4 right-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full bg-white p-2 rounded-xl"
                />
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pt-6 md:px-0 md:pt-0 md:pb-8">
          <div className="flex justify-between items-start mb-1">
            <span className="text-orange-500 font-medium text-sm">
              {product.category || "General"}
            </span>
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-sm">4.9</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 gap-2">
            {isEditing ? (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdateProduct()}
                className="text-2xl font-bold text-gray-800 border-b w-full outline-none"
                autoFocus
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            )}

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gray-900 text-white px-3 py-2 rounded-xl"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>

          <div className="mb-6">
            {isEditing ? (
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-sm w-full border-b outline-none"
              />
            ) : (
              <p className="text-gray-400 text-sm">{description}</p>
            )}
          </div>

          {editablePrices?.length > 0 && (
            <div className="mb-6 space-y-3">
              {editablePrices.map((p: any, index: number) => (
                <div
                  key={p.label}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm text-gray-600">{p.label}</span>

                  {isEditing ? (
                    <input
                      type="number"
                      value={p.price}
                      onChange={(e) => handlePriceChange(index, e.target.value)}
                      className="w-24 text-right border-b outline-none"
                    />
                  ) : (
                    <span className="font-semibold">
                      ${Number(p.price).toLocaleString("es-CO")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="hidden md:flex gap-4 mt-6">
            <button
              onClick={handleDeleteProduct}
              className="w-1/2 bg-red-600 text-white py-4 rounded-2xl font-bold"
            >
              Eliminar
            </button>

            {isEditing && (
              <button
                onClick={handleUpdateProduct}
                className="w-1/2 bg-green-600 text-white py-4 rounded-2xl font-bold"
              >
                Guardar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-md p-6 border-t flex justify-between items-center rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleDeleteProduct}
          className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold"
        >
          Eliminar
        </button>

        {isEditing && (
          <button
            onClick={handleUpdateProduct}
            className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold"
          >
            Guardar
          </button>
        )}
      </div>
    </div>
  );
}
