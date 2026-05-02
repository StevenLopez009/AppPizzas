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

const saboresInfo: Record<string, string> = {
  aceitunas:
    "Pizza con aceitunas que aportan un sabor intenso y ligeramente salado.",
  acaballo:
    "Carne desmechada, champiñones y tomate, con un sabor fuerte y tradicional.",
  atun_pollo: "Combinación de atún y pollo, suave pero con buen sabor.",
  campesina:
    "Carne desmechada, pollo y maíz tierno, estilo casero y equilibrado.",
  caprichosa: "Pollo, champiñones y tomate, una mezcla clásica y suave.",
  carne_champinon: "Carne desmechada con champiñones frescos, sabor profundo.",
  carnes_1: "Jamón, cabano picado y pepperoni, combinación de carnes intensas.",
  carnes_2: "Jamón, tocineta, chorizo y pepperoni, potente y jugosa.",
  carnes_3: "Jamón, chorizo y tocineta, mezcla clásica de carnes.",
  carnes_4: "Jamón, carne y pollo, combinación completa.",
  carretazo:
    "Jamón, tostacos, tomate, pollo y carne desmechada, textura crujiente y sabor fuerte.",
  criolla: "Carne desmechada, chorizo, maíz tierno y huevo, estilo colombiano.",
  cuatro_estaciones:
    "Pollo, champiñones, tomate y jamón, variedad en cada bocado.",
  deliciosa_especial:
    "Jamón, tocineta, cabano picado y maíz, combinación equilibrada.",
  especial: "Jamón, tocineta, cebolla, pimentón, champiñones, maíz y orégano.",
  guacapizza:
    "Aguacate, carne desmechada, tomate y jalapeños, sabor fresco y picante.",
  mediterranea: "Tomate, pollo y tocineta, mezcla ligera con buen sabor.",
  mexicana:
    "Carne, tomate, tostacos y jalapeños, ligeramente picante y crujiente.",
  montini: "Jamón, cabano picado, pollo y champiñones, combinación variada.",
  napolitana: "Tomate en rodajas con especias, sabor tradicional italiano.",
  paisa:
    "Fríjol, carne desmechada, chorizo y aguacate, estilo típico colombiano.",
  pepperoni: "Clásica pizza de pepperoni con sabor intenso.",
  perla_negra: "Jamón, tocineta y maíz, combinación dulce-salada.",
  pollo_champinon: "Pollo con champiñones, suave y cremosa.",
  pollo_cabano: "Pollo con cabano picado, mezcla de sabores suaves e intensos.",
  pollo_pepperoni:
    "Pollo con pepperoni, combinación clásica con un toque fuerte.",
  primavera: "Tomate, pollo y albahaca, fresca y ligera.",
  ranchera: "Pollo, chorizo, maíz y carne desmechada, sabor potente.",
  uva_pasa_tocineta: "Uvas pasas con tocineta, contraste dulce y salado.",
  vegetariana_3: "Cebolla, tomate, champiñones y pimentón, opción sin carne.",
  queso: "Solo queso mozzarella, suave y cremosa.",
  dlux: "Chorizo, tocineta, pollo, tomate y jalapeños, intensa y picante.",
  atun: "Atún con sabor suave y marino.",

  banano_arequipe: "Banano con arequipe, dulce y cremoso.",
  choco_queso: "Chocolate con queso, mezcla dulce con toque salado.",
  ciruela_tocineta: "Ciruela con tocineta, contraste dulce-salado.",
  coco_miel: "Coco rallado con miel, tropical y suave.",
  durazno_pina: "Durazno y piña, combinación frutal refrescante.",
  frutas: "Mezcla de frutas dulces como cerezas, uvas pasas y durazno.",
  hawaiana_1: "Jamón con piña, clásico dulce-salado.",
  hawaiana_2: "Jamón con durazno, sabor suave y dulce.",
  hawacoco: "Jamón, piña y coco rallado, tropical.",
  infantil_1: "Sabores dulces suaves ideales para niños.",
  infantil_2: "Combinación dulce pensada para los más pequeños.",
  infantil_3: "Mezcla dulce suave y agradable.",
  oreo_miel: "Oreo con miel, dulce intenso.",
  platano_bocadillo: "Plátano maduro con bocadillo, muy colombiano.",
  queso_bocadillo: "Queso con bocadillo, clásico dulce.",
  tropical: "Frutas tropicales como piña, durazno y cereza.",
};

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

  const sizes = [
    { label: "Mediana", price: 35000 },
    { label: "Personal", price: 19000 },
  ];

  const additionalsPizzaList = [
    { name: "Queso Mozarella", price: 5000 },
    { name: "Jalapeños", price: 2000 },
    { name: "Peperoni", price: 3000 },
    { name: "Pollo", price: 4000 },
    { name: "Carne Desmechada", price: 2000 },
    { name: "Jamon", price: 2000 },
  ];

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

  const handleSelect = (value: string, index: number) => {
    const nuevos = [...sabores];
    nuevos[index] = value;
    const filtrados = nuevos.filter(Boolean);
    if (filtrados.length <= 2) {
      setSabores(nuevos);
    }
  };

  const saboresSeleccionados = sabores.filter(Boolean);

  const descripcionDinamica = saboresSeleccionados.length
    ? saboresSeleccionados
        .map((s) => saboresInfo[s])
        .filter(Boolean)
        .join(" / ")
    : "Elige tus sabores favoritos para cada mitad de la pizza y disfruta de una experiencia personalizada y deliciosa.";

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

  const borderOptions = (
    <>
      <option value="queso">Queso Crema</option>
      <option value="arequipe">Arequipe</option>
      <option value="bocadillo">Bocadillo</option>
      <option value="chocolate">Chocolate</option>
      <option value="chocolate blanco">Chocolate blanco</option>
      <option value="fresa">Fresa</option>
      <option value="frutos amarillos">Frutos amarillos</option>
      <option value="frutos rojos">Frutos rojos</option>
      <option value="melocoton">Melocotón</option>
      <option value="mora">Mora</option>
      <option value="nucita">Nucita</option>
      <option value="nutela">Nutella</option>
    </>
  );

  return (
    <div className="bg-white min-h-screen font-sans">
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
              className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm active:scale-95 transition"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              <Heart size={20} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Right column: options */}
        <div className="px-6 pt-6 pb-32 md:pb-8 md:overflow-y-auto">
          <div className="flex justify-between items-start mb-1">
            <span className="text-gray-400 text-sm">Pizza</span>
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-sm">4.9</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Pizza por mitades
          </h1>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-2">Descripción</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              {descripcionDinamica}
            </p>
          </div>

          {/* Size */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3">Seleccione un tamaño</h3>
            <div className="flex gap-3">
              {sizes.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSelectedSize(s)}
                  className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition active:scale-95 ${
                    selectedSize?.label === s.label
                      ? "bg-brand text-white shadow-lg"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sweet flavors */}
          <div className="mb-5">
            <h3 className="font-bold text-gray-800 mb-3">Sabores Dulces</h3>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((i) => (
                <select
                  key={i}
                  className="w-full border rounded-xl p-3 bg-white text-sm"
                  value={sabores[i] || ""}
                  onChange={(e) => handleSelect(e.target.value, i)}
                  disabled={disabled && !sabores[i]}
                >
                  <option value="">Mitad {i + 1}</option>
                  <option value="banano_arequipe">Banano con arequipe</option>
                  <option value="choco_queso">Choco queso</option>
                  <option value="ciruela_tocineta">Ciruela con tocineta</option>
                  <option value="coco_miel">Coco miel</option>
                  <option value="durazno_pina">Durazno piña</option>
                  <option value="frutas">Frutas</option>
                  <option value="hawaiana_1">Hawaiana 1</option>
                  <option value="hawaiana_2">Hawaiana 2</option>
                  <option value="hawacoco">Hawacoco</option>
                  <option value="infantil_1">Infantil 1</option>
                  <option value="infantil_2">Infantil 2</option>
                  <option value="infantil_3">Infantil 3</option>
                  <option value="oreo_miel">Oreo miel</option>
                  <option value="platano_bocadillo">Plátano con bocadillo</option>
                  <option value="queso_bocadillo">Queso y bocadillo</option>
                  <option value="tropical">Tropical</option>
                </select>
              ))}
            </div>
          </div>

          {/* Sweet border */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3">Borde mitad dulce</h3>
            <select
              className="w-full border rounded-xl p-3 bg-white text-sm"
              value={borders[0]}
              onChange={(e) => handleBorderSelect(e.target.value, 0)}
            >
              <option value="">Selecciona borde</option>
              {borderOptions}
            </select>
          </div>

          {/* Savory flavors */}
          <div className="mb-5">
            <h3 className="font-bold text-gray-800 mb-3">Sabores de sal</h3>
            <div className="grid grid-cols-2 gap-3">
              {[2, 3].map((i) => (
                <select
                  key={i}
                  className="w-full border rounded-xl p-3 bg-white text-sm"
                  value={sabores[i] || ""}
                  onChange={(e) => handleSelect(e.target.value, i)}
                  disabled={disabled && !sabores[i]}
                >
                  <option value="">Mitad {i - 1}</option>
                  <option value="aceitunas">Aceitunas</option>
                  <option value="acaballo">Acaballo</option>
                  <option value="atun_pollo">Atún pollo</option>
                  <option value="campesina">Campesina</option>
                  <option value="caprichosa">Caprichosa</option>
                  <option value="carne_champinon">Carne desmechada champiñones</option>
                  <option value="carnes_1">Carnes 1</option>
                  <option value="carnes_2">Carnes 2</option>
                  <option value="carnes_3">Carnes 3</option>
                  <option value="carnes_4">Carnes 4</option>
                  <option value="carretazo">Carretazo</option>
                  <option value="criolla">Criolla</option>
                  <option value="cuatro_estaciones">Cuatro Estaciones</option>
                  <option value="deliciosa_especial">Deliciosa Especial</option>
                  <option value="especial">Especial</option>
                  <option value="guacapizza">Guacapizza</option>
                  <option value="mediterranea">Mediterránea</option>
                  <option value="mexicana">Mexicana</option>
                  <option value="montini">Montini</option>
                  <option value="napolitana">Napolitana</option>
                  <option value="paisa">Paisa</option>
                  <option value="pepperoni">Peperoni</option>
                  <option value="perla_negra">Perla negra</option>
                  <option value="pollo_champinon">Pollo champiñón</option>
                  <option value="pollo_cabano">Pollo cabano picado</option>
                  <option value="pollo_pepperoni">Pollo peperoni</option>
                  <option value="primavera">Primavera</option>
                  <option value="ranchera">Ranchera</option>
                  <option value="uva_pasa_tocineta">Uva pasa tocineta</option>
                  <option value="vegetariana_3">Vegetariana 3</option>
                  <option value="queso">Queso</option>
                  <option value="dlux">Dlux</option>
                  <option value="atun">Atún</option>
                </select>
              ))}
            </div>
          </div>

          {/* Savory border */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3">Borde mitad de sal</h3>
            <select
              className="w-full border rounded-xl p-3 bg-white text-sm"
              value={borders[1]}
              onChange={(e) => handleBorderSelect(e.target.value, 1)}
            >
              <option value="">Selecciona borde</option>
              {borderOptions}
            </select>
          </div>

          {/* Additionals */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3">
              Ingredientes adicionales
            </h3>
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
                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
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
              <div className="mt-3 p-3 bg-brand-surface rounded-xl">
                <div className="text-xs text-brand-text font-medium mb-2">
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

          {/* Footer: fixed on mobile, inline on md+ */}
          <div className="fixed md:static bottom-0 left-0 w-full md:w-auto md:rounded-2xl bg-white/90 md:bg-gray-50 backdrop-blur-md md:backdrop-blur-none p-6 border-t border-gray-100 md:border md:border-gray-200 flex justify-between items-center rounded-t-3xl shadow-2xl md:shadow-none">
            <div>
              <p className="text-gray-400 text-xs">Precio</p>
              <p className="text-2xl font-black text-gray-800">
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
