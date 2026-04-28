"use client";

import BannerCarousel from "@/src/features/menu/components/BannerCarousel";
import CategoryList from "@/src/features/menu/components/CategoryList";
import PizzaSelector from "@/src/features/menu/components/PizzaSelector";
import ProductGrid from "@/src/features/menu/components/ProductGrid";
import SearchBar from "@/src/features/menu/components/SearchBar";
import { useMenu } from "@/src/features/menu/hooks/useMenu";

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

  return (
    <div className="lg:px-4 mb-10">
      <div className="flex flex-col md:flex-row gap-6 mt-2">
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
