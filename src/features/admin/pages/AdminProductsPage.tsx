"use client";

import AdminProductGrid from "../components/AdminProductGrid";
import { useAdminProducts } from "../hooks/useAdminProducts";
import CategoryList from "../../menu/components/CategoryList";
import SearchBar from "../../menu/components/SearchBar";
import PizzaSelector from "../../menu/components/PizzaSelector";
import AdminBanner from "../components/AdminBanner";

export default function AdminProductsView() {
  const {
    foods,
    isAdmin,
    search,
    selectedCategory,
    pizzaCategory,

    setSearch,
    setSelectedCategory,
    setPizzaCategory,
  } = useAdminProducts();

  return (
    <div className="p-4 mb-10">
      <div className="flex flex-col md:flex-row gap-6 mt-2">
        <div className="w-full md:w-1/2">
          <AdminBanner />
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
          <AdminProductGrid foods={foods} isAdmin={isAdmin} />
        )}
      </div>
    </div>
  );
}
