"use client";

import { useEffect, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import Image from "next/image";

import "swiper/css";

import { createClient } from "@/lib/supabase/client";

interface Banner {
  id: string;
  image_url: string;
}

export default function BannerCarousel() {
  const supabase = createClient();

  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    async function getBanners() {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBanners(data);
      }
    }

    getBanners();
  }, []);

  return (
    <div className="w-full mt-5">
      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop
        spaceBetween={16}
        slidesPerView={1}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative h-48 md:h-60 xl:h-80 rounded-3xl overflow-hidden">
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
  );
}
