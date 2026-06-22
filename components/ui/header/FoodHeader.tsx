"use client";

import { useSettings } from "@/context/SettingsContext";
import BannerCarousel from "@/src/features/menu/components/BannerCarousel";
import CategoryList from "@/src/features/menu/components/CategoryList";
import PizzaSelector from "@/src/features/menu/components/PizzaSelector";
import ProductGrid from "@/src/features/menu/components/ProductGrid";
import SearchBar from "@/src/features/menu/components/SearchBar";
import { useMenu } from "@/src/features/menu/hooks/useMenu";
import { Clock } from "lucide-react";

export default function MenuView() {
  const {
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    pizzaCategory,
    setPizzaCategory,
    shuffledFoods,
  } = useMenu();

  const { storeOpen } = useSettings();

  if (!storeOpen) {
    return (
      <div className="flex flex-col items-center justify-center py-5 px-4 text-center animate-in fade-in duration-500">
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl max-w-sm w-full backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <div className="bg-brand/10 p-4 rounded-full text-brand">
              <Clock size={48} strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Tienda cerrada</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Por el momento no estamos aceptando pedidos. Vuelve pronto para
            disfrutar de nuestra carta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:px-4 mb-10">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          <BannerCarousel />
        </div>

        <div className="w-full md:w-1/2">
          <CategoryList
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            onResetPizza={() => setPizzaCategory(null)}
          />
        </div>
      </div>

      {selectedCategory === "Todos" && (
        <SearchBar value={search} onChange={setSearch} />
      )}

      <div className="mt-6">
        {selectedCategory === "Pizza" && !pizzaCategory ? (
          <PizzaSelector onSelectCategory={setPizzaCategory} />
        ) : (
          <ProductGrid foods={shuffledFoods} />
        )}
      </div>
    </div>
  );
}
