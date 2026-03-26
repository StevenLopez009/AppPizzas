"use client";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ChevronLeft,
  Heart,
  ShoppingBag,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import ImagePizza from "../../../assets/images/pizza2.jpg";
import { useCart } from "@/context/CartContext";

export default function PizzaMitadesPage() {
  const { addToCart } = useCart();
  const [selectedBorder, setSelectedBorder] = useState("");
  const [sabores, setSabores] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sizes = [
    { label: "Mediana", price: 35000 },
    { label: "Personal", price: 19000 },
  ];
  const [selectedSize, setSelectedSize] = useState<{
    label: string;
    price: number;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (selectedSize && sabores.filter(Boolean).length === 2) {
      setError(null);
    }
  }, [selectedSize, sabores]);

  const handleSelect = (value: string, index: number) => {
    const nuevos = [...sabores];
    nuevos[index] = value;
    const filtrados = nuevos.filter(Boolean);
    if (filtrados.length <= 2) {
      setSabores(nuevos);
    }
  };

  const saboresSeleccionados = sabores.filter(Boolean);
  const disabled = saboresSeleccionados.length >= 2;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError("Debes seleccionar un tamaño para tu pizza.");
      return;
    }
    if (saboresSeleccionados.length < 2) {
      setError("Por favor, elige los 2 sabores para las mitades.");
      return;
    }
    if (!selectedBorder) {
      setError("Por favor, elige un sabor para tu borde");
      return;
    }

    const item = {
      id: `mitades-${selectedSize.label}-${saboresSeleccionados.join("-")}`,
      name: "Pizza por mitades",
      price: selectedSize.price,
      size: selectedSize.label,
      image: ImagePizza.src,
      extra: `Mitades: ${saboresSeleccionados.join(" / ")} | Borde: ${selectedBorder || "Tradicional"}`,
      quantity: 1,
    };

    addToCart(item);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-24 relative font-sans">
      <div className="relative h-[300px] w-full">
        <Image
          src={ImagePizza}
          alt="Chocolate Cake"
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
          <div className="flex gap-2">
            <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              <Heart size={20} className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>
      <div className="px-6 pt-6">
        <div className="flex justify-between items-start mb-1">
          <span className="text-gray-400 text-sm">Pizza</span>
          <div className="flex items-center gap-1">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-sm">4.9</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Pizza por mitades
          </h1>
          {error && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-2">Description</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-3">
            Seleccione un tamaño{" "}
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {sizes.map((s) => (
              <button
                key={s.label}
                onClick={() => setSelectedSize(s)}
                className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition active:scale-95
        ${
          selectedSize?.label === s.label
            ? "bg-orange-500 text-white shadow-lg"
            : "bg-gray-100 text-gray-600"
        }
`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-3">Sabores Dulces</h3>
          <div className="flex gap-3 mb-4">
            {[0, 1].map((i) => (
              <select
                key={i}
                className="w-full border rounded-xl p-3 bg-white"
                value={sabores[i] || ""}
                onChange={(e) => handleSelect(e.target.value, i)}
                disabled={disabled && !sabores[i]}
              >
                <option value="">Selecciona sabor</option>
                <option value="chocolate">Chocolate</option>
                <option value="durazno">Durazno</option>
                <option value="pina">Piña</option>
                <option value="arequipe">Arequipe</option>
                <option value="fresa">Fresa</option>
              </select>
            ))}
          </div>

          <h3 className="font-bold text-gray-800 mb-3">Sabores de sal</h3>
          <div className="flex gap-3 mb-4">
            {[2, 3].map((i) => (
              <select
                key={i}
                className="w-full border rounded-xl p-3 bg-white"
                value={sabores[i] || ""}
                onChange={(e) => handleSelect(e.target.value, i)}
                disabled={disabled && !sabores[i]}
              >
                <option value="">Selecciona sabor</option>
                <option value="jamon_queso">Jamón y Queso</option>
                <option value="hawaiiana">Hawaiana</option>
                <option value="pepperoni">Pepperoni</option>
                <option value="pollo_champinon">Pollo Champiñón</option>
                <option value="vegetariana">Vegetariana</option>
                <option value="aceitunas">Aceitunas</option>
              </select>
            ))}
          </div>

          <h3 className="font-bold text-gray-800 mb-3">Bordes de la Pizza</h3>

          <select
            className="w-full border rounded-xl p-3 bg-white"
            value={selectedBorder}
            onChange={(e) => setSelectedBorder(e.target.value)}
          >
            <option value="">Selecciona borde</option>
            <option value="tradicional">Tradicional</option>
            <option value="queso">Relleno de queso</option>
            <option value="chocolate">Relleno de chocolate</option>
            <option value="arequipe">Relleno de arequipe</option>
          </select>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-md p-6 border-t border-gray-100 flex justify-between items-center rounded-t-3xl shadow-2xl">
        <div>
          <p className="text-gray-400 text-xs">Precio</p>
          <p className="text-2xl font-black text-gray-800">
            ${selectedSize?.price?.toLocaleString("es-CO") || 0}
          </p>
        </div>
        <button
          onClick={handleAddToCart}
          className="bg-orange-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold shadow-lg shadow-orange-900/20 active:scale-95 transition-transform"
        >
          <ShoppingBag size={20} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
