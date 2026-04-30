"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminProducts } from "../services/getAdminProducts";
import { getUserRole } from "./getUserRole";

export function useAdminProducts() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [pizzaCategory, setPizzaCategory] = useState<string | null>(null);
  const [foods, setFoods] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadProducts();
    loadRole();
  }, []);

  async function loadProducts() {
    try {
      const data = await getAdminProducts();
      setFoods(data);
    } finally {
      setLoading(false);
    }
  }

  async function loadRole() {
    const isUserAdmin = await getUserRole();
    setIsAdmin(isUserAdmin);
  }

  const filteredFoods = foods
    .filter((food) => {
      if (selectedCategory === "Todos") return true;

      if (selectedCategory === "Pizza") {
        if (pizzaCategory) {
          return food.category === pizzaCategory;
        }

        return food.category.includes("Pizza");
      }

      return food.category === selectedCategory;
    })
    .filter((food) => food.name.toLowerCase().includes(search.toLowerCase()));

  const shuffledFoods = useMemo(() => {
    return [...filteredFoods].sort(() => Math.random() - 0.5);
  }, [filteredFoods]);

  return {
    foods: shuffledFoods,
    loading,
    isAdmin,
    search,
    selectedCategory,
    pizzaCategory,

    setSearch,
    setSelectedCategory,
    setPizzaCategory,
  };
}
