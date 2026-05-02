"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Props {
  selectedCategory: string;
  onSelect: (category: string) => void;
  onResetPizza: () => void;
}

interface Category { id: string; name: string; sort_order: number }

export default function CategoryList({
  selectedCategory,
  onSelect,
  onResetPizza,
}: Props) {
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get<{ categories: Category[] }>("/api/categories")
      .then(({ categories }) => setDbCategories(categories))
      .catch(() => {});
  }, []);

  // Build menu items: "Todos" + deduplicate pizza variants into one "Pizza" entry
  const menuItems: { name: string }[] = [{ name: "Todos" }];
  let pizzaAdded = false;
  for (const cat of dbCategories) {
    if (cat.name.toLowerCase().includes("pizza")) {
      if (!pizzaAdded) { menuItems.push({ name: "Pizza" }); pizzaAdded = true; }
    } else {
      menuItems.push({ name: cat.name });
    }
  }

  return (
    <div className="w-full mt-5">
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              onSelect(item.name);

              if (item.name === "Pizza") {
                onResetPizza();
              }
            }}
            className={`
              min-w-[120px]
              lg:min-w-full
              rounded-2xl
              px-4
              py-3
              text-center
              shadow-sm
              transition
              active:scale-95

              ${
                selectedCategory === item.name
                  ? "bg-brand text-white"
                  : "bg-white text-gray-700"
              }
            `}
          >
            <p className="text-sm font-medium">{item.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
