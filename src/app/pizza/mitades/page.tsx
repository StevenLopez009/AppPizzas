"use client";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ChevronLeft,
  CircleX,
  Heart,
  ShoppingBag,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import ImagePizza from "@/assets/images/pizza2.jpg";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  ingredients: string[];
  prices: {
    label: string;
    price: number;
  }[];
}

interface Border {
  id: string;
  name: string;
}

export default function PizzaMitadesPage() {
  const { addToCart } = useCart();
  const [borders, setBorders] = useState<string[]>(["", ""]);
  const [sabores, setSabores] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedAdditionals, setSelectedAdditionals] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState<{
    label: string;
    price: number;
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [borderOptions, setBorderOptions] = useState<Border[]>([]);

  const sizes = [
    { label: "Mediana", price: 35000 },
    { label: "Personal", price: 19000 },
  ];

  const additionalsPizzaList = [{ name: "Queso Mozarella", price: 5000 }];

  const router = useRouter();

  const calcularPrecioTotal = () => {
    if (!selectedSize) return 0;

    const precioBase = selectedSize.price;
    const precioAdicionales = selectedAdditionals.reduce(
      (total, item) => total + item.price,
      0,
    );

    return precioBase + precioAdicionales;
  };

  useEffect(() => {
    if (selectedSize && sabores.filter(Boolean).length === 2) {
      setError(null);
    }
  }, [selectedSize, sabores]);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/borders").then((r) => r.json()),
    ]).then(([productsData, bordersData]) => {
      setProducts(productsData.products);
      setBorderOptions(bordersData.borders);
    });
  }, []);

  const sweetPizzas = products.filter((p) => p.category === "Pizza Dulce");

  const saltyPizzas = products.filter((p) => p.category === "Pizza Sal");

  const handleSelect = (value: string, index: number) => {
    const nuevos = [...sabores];
    nuevos[index] = value;
    const filtrados = nuevos.filter(Boolean);
    if (filtrados.length <= 2) {
      setSabores(nuevos);
    }
  };

  const saboresSeleccionados = sabores.filter(Boolean);

  const descripcionDinamica = saboresSeleccionados
    .map((id) => products.find((p) => p.id === id)?.description)
    .filter(Boolean)
    .join(" / ");

  const disabled = saboresSeleccionados.length >= 2;

  const handleBorderSelect = (value: string, index: number) => {
    const nuevos = [...borders];

    if (index === 0) {
      nuevos[0] = value;
      nuevos[1] = value;
    } else {
      nuevos[1] = value;
    }

    setBorders(nuevos);
  };

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
    if (!selectedSize) {
      setError("Debes seleccionar un tamaño para tu pizza.");
      return;
    }
    if (saboresSeleccionados.length < 2) {
      setError("Por favor, elige los 2 sabores para las mitades.");
      return;
    }
    if (!borders[0] || !borders[1]) {
      setError("Por favor, elige los bordes para tu pizza");
      return;
    }

    const precioTotal = calcularPrecioTotal();

    // Crear texto de adicionales para mostrar en el extra
    const adicionalesTexto =
      selectedAdditionals.length > 0
        ? ` | Adicionales: ${selectedAdditionals.map((a) => a.name).join(", ")}`
        : "";

    const id = `mitades-${selectedSize.label}-${saboresSeleccionados.join("-")}-${selectedAdditionals.map((a) => a.name).join("-")}`;
    const item = {
      id,
      product_id: id,
      name: "Pizza por mitades",
      price: precioTotal,
      size: selectedSize.label,
      image: ImagePizza.src,
      extra: `Mitades: ${saboresSeleccionados.join(" / ")} | Bordes: ${borders[0]} / ${borders[1]}${adicionalesTexto}`,
      quantity: 1,
      additionals: selectedAdditionals,
    };

    addToCart(item);
    setError(null);
    router.push("/");
  };

  return (
    <div className="bg-background text-fg min-h-screen font-sans transition-colors duration-300">
      <div className="max-w-5xl mx-auto md:grid md:grid-cols-[1fr_1fr] md:min-h-screen">
        {/* Left column: image (sticky on md+) */}
        <div className="relative h-[300px] md:h-auto md:sticky md:top-0 md:self-start md:min-h-screen">
          <Image
            src={ImagePizza}
            alt="Pizza por mitades"
            fill
            className="object-cover md:rounded-none"
            priority
          />
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="p-2 bg-surface/80 backdrop-blur-sm border border-line rounded-full shadow-sm text-fg"
            >
              <ChevronLeft size={20} className="text-fg-muted" />
            </button>
            <button className="p-2 bg-surface/80 backdrop-blur-sm border border-line rounded-full shadow-sm text-fg">
              <Heart size={20} className="text-fg-muted" />
            </button>
          </div>
        </div>

        {/* Right column: options */}
        <div className="px-6 pt-6 pb-32 md:pb-8 md:overflow-y-auto">
          <div className="flex justify-between items-start mb-1">
            <span className="text-fg-muted text-sm">Pizza</span>
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-sm">4.9</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-fg mb-3">Pizza por mitades</h1>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-bold text-fg mb-2">Descripción</h3>
            <p className="text-fg-muted leading-relaxed text-sm">
              {descripcionDinamica}
            </p>
          </div>

          {/* Size */}
          <div className="mb-6">
            <h3 className="font-bold text-fg mb-3">Seleccione un tamaño</h3>
            <div className="flex gap-3">
              {sizes.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSelectedSize(s)}
                  className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition active:scale-95 ${
                    selectedSize?.label === s.label
                      ? "bg-brand text-white shadow-lg"
                      : "bg-surface-muted text-fg-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sweet flavors */}
          <div className="mb-5">
            <h3 className="font-bold text-fg mb-3">Sabores Dulces</h3>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((i) => (
                <select
                  key={i}
                  className="w-full rounded-xl p-3 bg-surface border border-line text-fg text-sm"
                  value={sabores[i] || ""}
                  onChange={(e) => handleSelect(e.target.value, i)}
                  disabled={disabled && !sabores[i]}
                >
                  <option value="">Mitad {i + 1}</option>
                  {sweetPizzas.map((pizza) => (
                    <option key={pizza.id} value={pizza.id}>
                      {pizza.name}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>

          {/* Sweet border */}
          <div className="mb-6">
            <h3 className="font-bold text-fg mb-3">Borde mitad de Dulce</h3>

            <select
              className="w-full rounded-xl p-3 bg-surface border border-line text-fg text-sm"
              value={borders[0]}
              onChange={(e) => handleBorderSelect(e.target.value, 0)}
            >
              <option value="">Selecciona borde</option>

              {borderOptions.map((border) => (
                <option key={border.id} value={border.id}>
                  {border.name}
                </option>
              ))}
            </select>
          </div>

          {/* Savory flavors */}
          <div className="mb-5">
            <h3 className="font-bold text-fg mb-3">Sabores de sal</h3>
            <div className="grid grid-cols-2 gap-3">
              {[2, 3].map((i) => (
                <select
                  key={i}
                  className="w-full rounded-xl p-3 bg-surface border border-line text-fg text-sm"
                  value={sabores[i] || ""}
                  onChange={(e) => handleSelect(e.target.value, i)}
                  disabled={disabled && !sabores[i]}
                >
                  <option value="">Mitad {i - 1}</option>
                  {saltyPizzas.map((pizza) => (
                    <option key={pizza.id} value={pizza.id}>
                      {pizza.name}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>

          {/* Savory border */}
          <div className="mb-6">
            <h3 className="font-bold text-fg mb-3">Borde mitad de sal</h3>

            <select
              className="w-full rounded-xl p-3 bg-surface border border-line text-fg text-sm"
              value={borders[1]}
              onChange={(e) => handleBorderSelect(e.target.value, 1)}
            >
              <option value="">Selecciona borde</option>

              {borderOptions.map((border) => (
                <option key={border.id} value={border.id}>
                  {border.name}
                </option>
              ))}
            </select>
          </div>

          {/* Additionals */}
          <div className="mb-6">
            <h3 className="font-bold text-fg mb-3">Ingredientes adicionales</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {additionalsPizzaList.map((additional) => {
                const isSelected = selectedAdditionals.some(
                  (item) => item.name === additional.name,
                );
                return (
                  <button
                    key={additional.name}
                    onClick={() => toggleAdditional(additional)}
                    className={`p-3 rounded-xl text-left transition-all active:scale-95 ${
                      isSelected
                        ? "bg-brand text-white shadow-md"
                        : "bg-surface-muted text-fg border border-line hover:bg-line-muted"
                    }`}
                  >
                    <div className="font-medium text-sm">{additional.name}</div>
                    <div className="text-xs mt-1 opacity-80">
                      +${additional.price.toLocaleString("es-CO")}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedAdditionals.length > 0 && (
              <div className="mt-3 p-3 bg-brand-surface rounded-xl border border-line">
                <div className="text-xs text-brand-text font-medium mb-2">
                  Ingredientes seleccionados:
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedAdditionals.map((item) => (
                    <span
                      key={item.name}
                      className="inline-flex items-center gap-1 text-xs
          bg-surface text-fg
          px-2 py-1 rounded-full shadow-sm border border-line
          transition-colors duration-300"
                    >
                      {item.name}

                      <button
                        onClick={() => toggleAdditional(item)}
                        className="text-fg-muted hover:text-red-500 transition-colors"
                      >
                        <CircleX size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer: fixed on mobile, inline on md+ */}
          <div className="fixed md:static bottom-0 left-0 w-full md:w-auto md:rounded-2xl bg-surface/90 md:bg-surface-muted backdrop-blur-md md:backdrop-blur-none p-6 border-t  md:border border-line flex justify-between items-center rounded-t-3xl shadow-2xl md:shadow-none">
            <div>
              <p className="text-fg-muted text-xs">Precio</p>
              <p className="text-2xl font-black text-fg">
                ${calcularPrecioTotal().toLocaleString("es-CO")}
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold shadow-lg active:scale-95 transition-transform"
            >
              <ShoppingBag size={20} />
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
