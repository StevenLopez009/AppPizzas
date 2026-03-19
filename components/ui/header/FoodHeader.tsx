"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import FoodCard from "../foodCard/FoodCard";
import pizza1 from "../../../assets/images/pizza1.png";
import { useState } from "react";
import PizzaSection from "@/components/pizzaSection/PizzaSection";

export default function FoodHeader() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const banners = [{}, {}, {}];

  const foods = [
    {
      id: 1,
      image: pizza1,
      title: 'Pizza "Italian"',
      size: "30 cm",
      price: 7.5,
      category: "Pizza",
    },
    {
      id: 2,
      image: pizza1,
      title: "Pizza Especial",
      size: "25 cm",
      price: 6.0,
      category: "Pizza",
    },
    {
      id: 3,
      image: pizza1,
      title: "panzerotti ",
      size: "400 gr",
      price: 8.2,
      category: "Panzerotti",
    },
    {
      id: 4,
      image: pizza1,
      title: "postre Oreo",
      size: "500 ml",
      price: 4.5,
      category: "Postre",
    },
    {
      id: 5,
      image: pizza1,
      title: "postre leche",
      size: "32 cm",
      price: 9.0,
      category: "Postre",
    },
  ];

  const filteredFoods =
    selectedCategory === "Todos"
      ? foods
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
              onClick={() => setSelectedCategory(item.name)}
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
      <p></p>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {selectedCategory === "Pizza" ? (
          <PizzaSection />
        ) : (
          <>
            {filteredFoods.map((food) => (
              <FoodCard
                key={food.id}
                image={food.image}
                title={food.title}
                size={food.size}
                price={food.price}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
