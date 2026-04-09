"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function ProductUI({ product }: { product: any }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.prices[0]);
  const [selectedBorder, setSelectedBorder] = useState("");
  const [selectedAdditional, setSelectedAdditional] = useState<any | null>(
    null,
  );
  const [observations, setObservations] = useState("");

  const router = useRouter();

  const hasMultiplePrices = product.prices?.length > 1;
  const isPizza = product.category?.toLowerCase().includes("pizza");
  const additionalsList = [
    { name: "queso", price: 3000 },
    { name: "aceitunas", price: 2000 },
  ];

  const additionalPrice = selectedAdditional?.price || 0;
  const finalPrice = selectedSize.price + additionalPrice;

  const handleAddToCart = () => {
    const item = {
      id: crypto.randomUUID(),
      product_id: product.id,

      name: product.name,
      price: finalPrice,
      size: selectedSize.label,
      image: product.image_url,

      extra: isPizza ? selectedBorder : null,
      additional:
        isPizza && selectedAdditional
          ? {
              name: selectedAdditional.name,
              price: selectedAdditional.price,
            }
          : null,
      observations: observations,

      quantity: 1,
    };

    console.log("Item a guardar:", item);
    addToCart(item);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-24 relative font-sans">
      <div className="relative h-[220px] w-full bg-gray-100">
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
            <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              <Heart size={20} className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 pt-4">
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
          <h1 className="text-2xl font-bold text-gray-800 leading-tight">
            {product.name}
          </h1>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>

        {hasMultiplePrices && (
          <div className="mb-4">
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
          <>
            <div className="mb-2">
              <h3 className="font-bold text-gray-800 mb-3">
                Bordes de la Pizza
              </h3>
              <select
                value={selectedBorder}
                onChange={(e) => setSelectedBorder(e.target.value)}
                className="w-full border border-gray-100 rounded-xl p-3 bg-gray-50 text-gray-600 outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="">---</option>
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
            <div>
              <h3 className="font-bold text-gray-800 mb-3">
                Ingredientes Adicionales
              </h3>
              <select
                value={selectedAdditional?.name || ""}
                onChange={(e) => {
                  const selected = additionalsList.find(
                    (a) => a.name === e.target.value,
                  );
                  setSelectedAdditional(selected || null);
                }}
                className="w-full border border-gray-100 rounded-xl p-3 bg-gray-50 text-gray-600 outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="">---</option>
                {additionalsList.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name} (+${a.price})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Quieres eliminar algo del pedido? Ej: Sin cebolla, etc..."
          className="w-full mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder-gray-400 
  outline-none resize-none transition-all duration-200
  focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 mb-6"
        />
      </div>

      {/* BARRA INFERIOR DE COMPRA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-md p-6 border-t border-gray-100 flex justify-between items-center rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div>
          <p className="text-gray-400 text-xs">Precio</p>
          <p className="text-2xl font-black text-gray-800">
            ${(selectedSize.price + additionalPrice).toLocaleString("es-CO")}
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
