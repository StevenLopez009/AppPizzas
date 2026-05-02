"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdditionals } from "../services/getAdditionals";

export function useProductDetail(product: any) {
  const [selectedSize, setSelectedSize] = useState(product.prices[0]);

  const [selectedBorder, setSelectedBorder] = useState("");

  const [selectedAdditionals, setSelectedAdditionals] = useState<any[]>([]);

  const [additionals, setAdditionals] = useState<any[]>([]);

  const [observations, setObservations] = useState("");

  const isPizza = product.category?.toLowerCase().includes("pizza");

  const isLasagna = product.category
    ?.toLowerCase()
    .includes("lasaña spaguetti");

  const isComidaRapida = product.category?.toLowerCase().includes("com");

  useEffect(() => {
    async function loadAdditionals() {
      const category = product.category?.toLowerCase() || "";

      let dbCategory = "";

      if (category.includes("pizza")) {
        dbCategory = "pizza";
      } else if (category.includes("lasagna") || category.includes("lasaña")) {
        dbCategory = "lasagna";
      } else if (category.includes("com")) {
        dbCategory = "Com. Rapidas";
      }

      if (!dbCategory) return;

      const data = await getAdditionals(dbCategory);

      setAdditionals(data);
    }

    loadAdditionals();
  }, [product.category]);

  const toggleAdditional = (additional: any) => {
    setSelectedAdditionals((prev) => {
      const exists = prev.find((item) => item.name === additional.name);

      if (exists) {
        return prev.filter((item) => item.name !== additional.name);
      }

      return [...prev, additional];
    });
  };

  const additionalsTotalPrice = useMemo(() => {
    return selectedAdditionals.reduce((total, item) => total + item.price, 0);
  }, [selectedAdditionals]);

  const finalPrice = selectedSize.price + additionalsTotalPrice;

  return {
    selectedSize,
    setSelectedSize,

    selectedBorder,
    setSelectedBorder,

    selectedAdditionals,
    toggleAdditional,

    additionals,

    observations,
    setObservations,

    finalPrice,

    isPizza,
    isLasagna,
    isComidaRapida,
  };
}
