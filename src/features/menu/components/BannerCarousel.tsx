"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import Image from "next/image";

import "swiper/css";

import { banners } from "../constants/banners";

export default function BannerCarousel() {
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
        {banners.map((banner, index) => (
          <SwiperSlide key={index}>
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
