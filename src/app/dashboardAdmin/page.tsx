"use client";
import FoodCard from "@/components/ui/foodCard/FoodCard";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import PizzaSection from "@/components/pizzaSection/PizzaSection";
import { getProducts } from "@/lib/products";
import { useMemo } from "react";

export default function Page() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [pizzaCategory, setPizzaCategory] = useState<string | null>(null);
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      const data = await getProducts();
      setFoods(data);
      setLoading(false);
    }
    loadProducts();
  }, []);

  useEffect(() => {
    async function loadUserRole() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        setIsAdmin(true);
      }
    }

    loadUserRole();
  }, []);

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
    .filter((food) => {
      return food.name.toLowerCase().includes(search.toLowerCase());
    });

  const shuffledFoods = useMemo(() => {
    return [...filteredFoods].sort(() => Math.random() - 0.5);
  }, [filteredFoods]);

  return (
    <div className="p-4 mb-10">
      <div className="w-full px-4 py-4 flex items-center justify-between">
        <button className="text-2xl text-gray-600">☰</button>
        <h1 className="text-lg font-semibold text-gray-700">La Carreta</h1>
        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-300"></div>
      </div>
      <div className="mt-2 flex flex-col lg:flex-row gap-6">
        <div className="w-full bg-gray-200 h-40 rounded-3xl">
          <h2>banner admin</h2>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {[
            { name: "Todos" },
            { name: "Pizza" },
            { name: "Panzerotti" },
            { name: "Lasaña Spaguetti" },
            { name: "Com. Rapidas" },
            { name: "Platos Fuertes" },
            { name: "Bebidas" },
          ].map((item) => (
            <div
              key={item.name}
              onClick={() => {
                setSelectedCategory(item.name);

                if (item.name === "Pizza") {
                  setPizzaCategory(null);
                }
              }}
              className={`min-w-[120px] rounded-2xl px-4 py-3 text-center shadow-sm flex-shrink-0 cursor-pointer active:scale-95 transition ${
                selectedCategory === item.name
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              <p className="text-sm font-medium text-white-600">{item.name}</p>
            </div>
          ))}
        </div>
        {selectedCategory === "Todos" && (
          <div className="relative mt-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tus platos favoritos ..."
              className="w-full py-3 pl-4 pr-4 rounded-2xl border border-gray-200 
                       bg-white shadow-sm text-sm 
                       focus:outline-none focus:ring-2 focus:ring-orange-400 
                       focus:border-transparent transition"
            />
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {shuffledFoods.map((food) => (
          <FoodCard
            key={food.id}
            id={food.id}
            image={food.image_url}
            title={food.name}
            size={"--"}
            price={food.price}
            category={food.category}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
}
