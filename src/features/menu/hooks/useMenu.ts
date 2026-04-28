"use client";

import { useEffect, useMemo, useState } from "react";

import { getProducts } from "../services/getProducts";
import { filterProducts } from "../utils/filterProducts";
import { shuffleProducts } from "../utils/shuffleProducts";

export function useMenu() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [pizzaCategory, setPizzaCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setFoods(data);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredFoods = useMemo(() => {
    return filterProducts({
      foods,
      selectedCategory,
      pizzaCategory,
      search,
    });
  }, [foods, selectedCategory, pizzaCategory, search]);

  const shuffledFoods = useMemo(() => {
    return shuffleProducts(filteredFoods);
  }, [filteredFoods]);

  return {
    loading,

    search,
    setSearch,

    selectedCategory,
    setSelectedCategory,

    pizzaCategory,
    setPizzaCategory,

    shuffledFoods,
  };
}
