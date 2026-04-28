"use client";

import { useMenu } from "../hooks/useMenu";

import BannerCarousel from "./BannerCarousel";
import CategoryList from "./CategoryList";
import SearchBar from "./SearchBar";
import ProductGrid from "./ProductGrid";
import PizzaSelector from "./PizzaSelector";

export default function FoodHeader() {
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
      <BannerCarousel />

      <CategoryList
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
        onResetPizza={() => setPizzaCategory(null)}
      />

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
