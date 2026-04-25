"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import FoodCard from "../foodCard/FoodCard";
import { useEffect, useState } from "react";
import PizzaSection from "@/components/pizzaSection/PizzaSection";
import { getProducts } from "@/lib/products";
import { useMemo } from "react";
import { Autoplay } from "swiper/modules";
import Image from "next/image";
import bannerImg from "../../../assets/images/banner.png";
import bannerImg2 from "../../../assets/images/banner2.jpg";
import bannerImg3 from "../../../assets/images/banner3.jpg";

export default function FoodHeader() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [pizzaCategory, setPizzaCategory] = useState<string | null>(null);
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const banners = [
    { image_url: bannerImg },
    { image_url: bannerImg2 },
    { image_url: bannerImg3 },
  ];

  useEffect(() => {
    async function loadProducts() {
      const data = await getProducts();
      setFoods(data);
      setLoading(false);
    }

    loadProducts();
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
    <div className="lg:px-4 mb-10">
      <div className="w-full px-4 py-4 flex items-center justify-between">
        <button className="text-2xl text-gray-600">☰</button>
        <h1 className="text-lg font-semibold text-gray-700">La Carreta</h1>
        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-300"></div>
      </div>
      <div className="mt-2 flex flex-col lg:flex-row gap-6 rounded-3xl overflow-hidden">
        <div className="w-full lg:w-[60%]">
          <Swiper
            modules={[Autoplay]}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            loop={true}
            spaceBetween={16}
            slidesPerView={1}
          >
            {banners.map((banner, index) => (
              <SwiperSlide key={index}>
                <div className="relative h-45 md:h-56 lg:h-42 xl:h-80 rounded-3xl overflow-hidden">
                  <Image
                    src={banner.image_url}
                    alt="banner"
                    fill
                    className="object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="w-full lg:w-[40%]">
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 no-scrollbar h-full max-h-[320px] lg:max-h-[320px]">
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
                className={`min-w-[120px] lg:min-w-full rounded-2xl px-4 py-3 text-center shadow-sm flex-shrink-0 lg:flex-shrink cursor-pointer active:scale-95 transition ${
                  selectedCategory === item.name
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                <p className="text-sm font-medium text-white-600">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </div>
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

      <div className="lg:w-full mt-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {selectedCategory === "Pizza" && !pizzaCategory ? (
          <div className="col-span-full">
            <PizzaSection onSelectCategory={setPizzaCategory} />
          </div>
        ) : (
          shuffledFoods.map((food) => (
            <FoodCard
              key={food.id}
              id={food.id}
              image={food.image_url}
              title={food.name}
              size={"--"}
              price={food.price}
              category={food.category}
              description={food.description}
            />
          ))
        )}
      </div>
    </div>
  );
}
