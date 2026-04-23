"use client";
import { ChevronLeft, Pencil, Star } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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

  const supabase = createClient();

  const hasMultiplePrices = product.prices?.length > 1;

  const isPizza =
    product.category?.toLowerCase().includes("pizza") &&
    product.prices?.length > 1;

  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpdateProduct = async () => {
    let imageUrl = product.image_url;

    if (file) {
      const fileName = `products/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error(uploadError);
        alert("Error subiendo imagen");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;

      if (product.image_url) {
        const oldPath = product.image_url.split("/products/")[1];

        if (oldPath) {
          await supabase.storage.from("products").remove([oldPath]);
        }
      }
    }

    await supabase
      .from("products")
      .update({
        name: title,
        description,
        prices: editablePrices,
        image_url: imageUrl,
      })
      .eq("id", product.id);

    setIsEditing(false);
    setFile(null);
    setPreview(null);

    router.refresh();
  };

  const handlePriceChange = (index: number, value: string) => {
    const updated = [...editablePrices];
    updated[index].price = Number(value);
    setEditablePrices(updated);
  };

  const handleDeleteProduct = async () => {
    const confirmDelete = confirm(
      "¿Seguro que quieres eliminar este producto?",
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      console.error(error);
      alert("Error al eliminar el producto");
      return;
    }

    router.push("/dashboardAdmin");
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-24 relative font-sans">
      <div className="relative h-[350px] w-full bg-gray-100">
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md "
            >
              <Pencil size={16} />
            </button>
          </div>
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

      <div className="px-6 pt-6">
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
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdateProduct();
              }}
              className="text-2xl font-bold text-gray-800 leading-tight border-b border-gray-300 outline-none w-full"
              autoFocus
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">
              {title}
            </h1>
          )}

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-xl text-sm font-semibold shadow-md"
            >
              <Pencil size={16} />
            </button>
          )}
        </div>
        <div className="mb-8">
          {isEditing ? (
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm text-gray-700 w-full border-b border-gray-300 outline-none"
            />
          ) : (
            <p className="text-gray-400 text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {editablePrices?.length > 0 && (
          <div className="mb-4 space-y-2">
            {editablePrices.map((p: any, index: number) => (
              <div key={p.label} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{p.label}</span>

                {isEditing ? (
                  <input
                    type="number"
                    value={p.price}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    className="w-24 text-right border-b border-gray-300 outline-none"
                  />
                ) : (
                  <span className="text-sm font-semibold">
                    ${p.price.toLocaleString("es-CO")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-md p-6 border-t border-gray-100 flex justify-between items-center rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <>
          <button
            onClick={handleDeleteProduct}
            className="bg-red-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold shadow-lg shadow-orange-900/20 active:scale-95 transition-transform"
          >
            Eliminar
          </button>
          {isEditing && (
            <button
              onClick={handleUpdateProduct}
              className="bg-green-600 text-white px-8 py-4 rounded-2xl"
            >
              Guardar cambios
            </button>
          )}
        </>
      </div>
    </div>
  );
}
