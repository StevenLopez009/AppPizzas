"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import FoodCard from "../foodCard/FoodCard";
import { useEffect, useState } from "react";
import PizzaSection from "@/components/pizzaSection/PizzaSection";
import { getProducts } from "@/lib/products";

export default function FoodHeader() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [pizzaCategory, setPizzaCategory] = useState<string | null>(null);
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const banners = [{}, {}, {}];

  useEffect(() => {
    async function loadProducts() {
      const data = await getProducts();
      setFoods(data);
      setLoading(false);
    }

    loadProducts();
  }, []);

  const filteredFoods =
    selectedCategory === "Todos"
      ? foods
      : selectedCategory === "Pizza"
        ? pizzaCategory
          ? foods.filter((f) => f.category === pizzaCategory)
          : foods.filter((f) => f.category.includes("Pizza"))
        : foods.filter((f) => f.category === selectedCategory);

  return (
    <div className="p-4">
      <div className="w-full px-4 py-4 flex items-center justify-between">
        <button className="text-2xl text-gray-600">☰</button>
        <h1 className="text-lg font-semibold text-gray-700">Carreta</h1>
        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-300"></div>
      </div>
      <Swiper spaceBetween={16} slidesPerView={1}>
        {banners.map((banner, index) => (
          <SwiperSlide key={index}>
            <div className="h-35 bg-black text-white rounded-3xl p-5 flex items-center justify-between overflow-hidden">
              <div></div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mt-6">
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {[
            { name: "Todos" },
            { name: "Pizza" },
            { name: "Panzerotti" },
            { name: "Pl. fuertes" },
            { name: "Com. Rapidas" },
            { name: "Bebidas" },
            { name: "Postre" },
            { name: "Promos" },
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
              <p className="text-sm font-medium text-gray-600">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {selectedCategory === "Pizza" && !pizzaCategory ? (
          <PizzaSection onSelectCategory={setPizzaCategory} />
        ) : (
          filteredFoods.map((food) => (
            <FoodCard
              key={food.id}
              id={food.id}
              image={food.image_url}
              title={food.name}
              size={"--"}
              price={food.price}
              category={food.category}
            />
          ))
        )}
      </div>
    </div>
  );
}
