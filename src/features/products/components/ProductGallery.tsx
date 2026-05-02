"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Heart } from "lucide-react";

export default function ProductGallery({ product }: { product: any }) {
  const router = useRouter();

  return (
    <div className="relative md:sticky md:h-[calc(100vh-3rem)]">
      <div className="relative h-[220px] md:h-full">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover rounded-2xl"
        />

        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white rounded-full"
          >
            <ChevronLeft />
          </button>

          <button className="p-2 bg-white rounded-full">
            <Heart />
          </button>
        </div>
      </div>
    </div>
  );
}
