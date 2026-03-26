"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

export default function AdminDashboard() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const banners = [{}, {}, {}];

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (data.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        window.location.href = "/dashboard";
      }
    };

    checkAdmin();
  }, []);

  return (
    <div className="p-4">
      <div className="w-full px-4 py-4 flex items-center justify-between">
        <button className="text-2xl text-gray-600">☰</button>
        <h1 className="text-lg font-semibold text-gray-700">Admin</h1>
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
            { name: "Crear Productos" },
            { name: "Pedidos" },
            { name: "Ventas" },
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
    </div>
  );
}
