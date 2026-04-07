"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, Heart, ShoppingBag, Star } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";

export default function ProductUI({ product }: { product: any }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.prices[0]);
  const [selectedBorder, setSelectedBorder] = useState("tradicional");
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  useEffect(() => {
    const getUserRole = async () => {
      const { data: userData } = await supabase.auth.getUser();

      const user = userData.user;

      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        setIsAdmin(true);
      }
    };

    getUserRole();
  }, []);

  const hasMultiplePrices = product.prices?.length > 1;
  const isPizza =
    product.category?.toLowerCase().includes("pizza") &&
    product.prices?.length > 1;

  const handleAddToCart = () => {
    const item = {
      id: crypto.randomUUID(),
      product_id: product.id,

      name: product.name,
      price: selectedSize.price,
      size: selectedSize.label,
      image: product.image_url,

      extra: product.category?.toLowerCase().includes("pizza")
        ? `Borde: ${selectedBorder}`
        : null,

      quantity: 1,
    };

    addToCart(item);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-24 relative font-sans">
      <div className="relative h-[350px] w-full bg-gray-100">
        <Image
          src={product.image_url || "/placeholder-pizza.jpg"}
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
            {isAdmin ? (
              <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md ">
                Editar
              </button>
            ) : (
              <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                <Heart size={20} className="text-gray-700" />
              </button>
            )}
          </div>
        </div>
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800 leading-tight">
            {product.name}
          </h1>

          {isAdmin && (
            <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md ">
              Editar
            </button>
          )}
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-800">Descripción</h3>

            {isAdmin && (
              <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md ">
                Editar
              </button>
            )}
          </div>

          <p className="text-gray-400 text-sm leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* --- RENDERIZADO CONDICIONAL DE TAMAÑOS --- */}
        {hasMultiplePrices && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-3">
              Seleccione un tamaño
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product.prices.map((s: any) => (
                <button
                  key={s.label}
                  onClick={() => setSelectedSize(s)}
                  className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition active:scale-95
                    ${
                      selectedSize?.label === s.label
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {isPizza && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-3">Bordes de la Pizza</h3>
            <select className="w-full border border-gray-100 rounded-xl p-3 bg-gray-50 text-gray-600 outline-none focus:ring-2 focus:ring-orange-500/20">
              <option value="queso">Queso</option>
              <option value="arequipe">arequipe</option>
              <option value="bocadillo">bocadillo</option>
              <option value="chocolate">chocolate</option>
              <option value="chocolate blanco">chocolate blanco</option>
              <option value="fresa">fresa</option>
              <option value="frutos amarillos">frutos amarillos</option>
              <option value="frutos rojos">frutos rojos</option>
              <option value="melocoton">melocoton</option>
              <option value="mora">mora</option>
              <option value="nucita">nucita</option>
              <option value="nutela">nutela</option>
              <option value="queso crema">queso crema</option>
            </select>
          </div>
        )}
      </div>

      {/* BARRA INFERIOR DE COMPRA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-md p-6 border-t border-gray-100 flex justify-between items-center rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div>
          <p className="text-gray-400 text-xs">Precio</p>
          <p className="text-2xl font-black text-gray-800">
            ${selectedSize?.price?.toLocaleString("es-CO") || 0}
          </p>
        </div>

        <button
          className="bg-orange-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold shadow-lg shadow-orange-900/20 active:scale-95 transition-transform"
          onClick={handleAddToCart}
        >
          <ShoppingBag size={20} />
          Agregar
        </button>
      </div>
    </div>
  );
}
