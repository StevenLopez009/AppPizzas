"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, CircleX, Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function ProductUI({ product }: { product: any }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.prices[0]);
  const [selectedBorder, setSelectedBorder] = useState("");
  const [selectedAdditionals, setSelectedAdditionals] = useState<any[]>([]);
  const [observations, setObservations] = useState("");

  const router = useRouter();

  const hasMultiplePrices = product.prices?.length > 1;
  const isPizza = product.category?.toLowerCase().includes("pizza");
  const isLasagna = product.category
    ?.toLowerCase()
    .includes("lasaña spaguetti");

  const additionalsPizzaList = [
    { name: "Queso Mozarella", price: 5000 },
    { name: "Jalapeños", price: 2000 },
    { name: "Peperoni", price: 3000 },
    { name: "Pollo", price: 4000 },
    { name: "Carne Desmechada", price: 2000 },
    { name: "Jamon", price: 2000 },
  ];
  const additionalsLasagnaList = [
    { name: "Pan de ajo", price: 3000 },
    { name: "Cubiertos", price: 1000 },
  ];

  const additionalsTotalPrice = selectedAdditionals.reduce(
    (total, item) => total + item.price,
    0,
  );
  const finalPrice = selectedSize.price + additionalsTotalPrice;

  const toggleAdditional = (additional: any) => {
    setSelectedAdditionals((prev) => {
      const exists = prev.find((item) => item.name === additional.name);
      if (exists) {
        // Si ya existe, lo quitamos
        return prev.filter((item) => item.name !== additional.name);
      } else {
        // Si no existe, lo agregamos
        return [...prev, additional];
      }
    });
  };

  const handleAddToCart = () => {
    const item = {
      id: crypto.randomUUID(),
      product_id: product.id,

      name: product.name,
      price: finalPrice,
      size: selectedSize.label,
      image: product.image_url,

      extra: isPizza ? selectedBorder : null,
      additionals: selectedAdditionals,
      observations: observations,

      quantity: 1,
    };

    console.log("Item a guardar:", item);
    addToCart(item);
    router.push("/");
  };

  return (
    <div className="max-w-7xl mx-auto bg-white min-h-screen relative font-sans">
      <div className="md:grid md:grid-cols-2 md:gap-8 md:px-6 lg:px-8 md:pt-2">
        <div className="relative md:sticky md:h-[calc(100vh-3rem)] md:rounded-2xl md:overflow-hidden">
          <div className="relative h-[220px] w-full bg-gray-100 md:h-full md:min-h-[500px]">
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
        </div>

        {/* SECCIÓN DE INFORMACIÓN DEL PRODUCTO */}
        <div className="px-6 pt-4 md:px-0 md:pt-0 md:pb-8">
          {/* Header: Categoría y Rating */}
          <div className="flex justify-between items-start mb-1">
            <span className="text-orange-500 font-medium text-sm">
              {product.category || "General"}
            </span>
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-sm">4.9</span>
            </div>
          </div>

          {/* Título del producto */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Descripción */}
          <div className="mb-4">
            <p className="text-gray-400 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Selector de Tamaño */}
          {hasMultiplePrices && (
            <div className="mb-4">
              <h3 className="font-bold text-gray-800 mb-3">
                Seleccione un tamaño
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap">
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

          {/* Opciones para Pizza */}
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
                  <option value="queso">Queso Crema</option>
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
                </select>
              </div>
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 mb-3">
                  Ingredientes Adicionales (puedes seleccionar varios)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {additionalsPizzaList.map((additional) => {
                    const isSelected = selectedAdditionals.some(
                      (item) => item.name === additional.name,
                    );
                    return (
                      <button
                        key={additional.name}
                        onClick={() => toggleAdditional(additional)}
                        className={`p-3 rounded-xl text-left transition-all active:scale-95
                      ${
                        isSelected
                          ? "bg-orange-500 text-white shadow-md"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }
                    `}
                      >
                        <div className="font-medium text-sm">
                          {additional.name}
                        </div>
                        <div className="text-xs mt-1 opacity-80">
                          +${additional.price.toLocaleString("es-CO")}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedAdditionals.length > 0 && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-xl">
                    <div className="text-xs text-orange-600 font-medium mb-2">
                      Ingredientes seleccionados:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedAdditionals.map((item) => (
                        <span
                          key={item.name}
                          className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full shadow-sm"
                        >
                          {item.name}
                          <button
                            onClick={() => toggleAdditional(item)}
                            className="hover:text-red-500"
                          >
                            <CircleX size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Opciones para Lasagna */}
          {isLasagna && (
            <>
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 mb-3">
                  Ingredientes Adicionales (puedes seleccionar varios)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {additionalsLasagnaList.map((additional) => {
                    const isSelected = selectedAdditionals.some(
                      (item) => item.name === additional.name,
                    );
                    return (
                      <button
                        key={additional.name}
                        onClick={() => toggleAdditional(additional)}
                        className={`p-3 rounded-xl text-left transition-all active:scale-95
                      ${
                        isSelected
                          ? "bg-orange-500 text-white shadow-md"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }
                    `}
                      >
                        <div className="font-medium text-sm">
                          {additional.name}
                        </div>
                        <div className="text-xs mt-1 opacity-80">
                          +${additional.price.toLocaleString("es-CO")}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedAdditionals.length > 0 && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-xl">
                    <div className="text-xs text-orange-600 font-medium mb-2">
                      Ingredientes seleccionados:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedAdditionals.map((item) => (
                        <span
                          key={item.name}
                          className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full shadow-sm"
                        >
                          {item.name}
                          <button
                            onClick={() => toggleAdditional(item)}
                            className="hover:text-red-500"
                          >
                            <CircleX size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Campo de observaciones */}
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Quieres eliminar algo del pedido? Ej: Sin cebolla, etc..."
            className="w-full mt-2 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder-gray-400 
            outline-none resize-none transition-all duration-200
            focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          />

          {/* BARRA DE COMPRA - Solo visible en tablet/PC (dentro del flujo, debajo del textarea) */}
          <div className="hidden md:flex mt-2 bg-white/90 backdrop-blur-md p-6 border border-gray-100 rounded-2xl justify-between items-center shadow-lg">
            <div>
              <p className="text-gray-400 text-xs">Precio</p>
              <p className="text-2xl font-black text-gray-800">
                $
                {(selectedSize.price + additionalsTotalPrice).toLocaleString(
                  "es-CO",
                )}
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
      </div>

      {/* BARRA INFERIOR DE COMPRA - Solo visible en móvil (fija en la parte inferior) */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:hidden bg-white/90 backdrop-blur-md p-6 border-t border-gray-100 flex justify-between items-center rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div>
          <p className="text-gray-400 text-xs">Precio</p>
          <p className="text-2xl font-black text-gray-800">
            $
            {(selectedSize.price + additionalsTotalPrice).toLocaleString(
              "es-CO",
            )}
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
