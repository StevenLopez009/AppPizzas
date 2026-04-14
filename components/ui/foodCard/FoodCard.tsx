import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

type FoodCardProps = {
  id: string;
  image: string;
  title: string;
  size: string;
  price: number;
  category: string;
  isAdmin?: boolean;
};

export default function FoodCard({ id, image, title, isAdmin }: FoodCardProps) {
  const href = isAdmin
    ? `/dashboardAdmin/updateProduct/${id}`
    : `/dashboard/product/${id}`;

  return (
    <Link href={href} className="w-full">
      <div className="relative w-full h-50 lg:h-[40%] bg-[#F5F5F5] rounded-[24px] sm:rounded-[28px] p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
        <div className="flex justify-center mt-1 sm:mt-2">
          <Image
            src={image}
            alt={title}
            width={140}
            height={140}
            className="object-contain drop-shadow-lg w-[90px] sm:w-[120px]"
          />
        </div>

        <div className="mt-2 sm:mt-3 flex justify-between items-start gap-2">
          <div className="flex-1">
            <h3 className="text-gray-800 font-semibold text-sm sm:text-base leading-tight">
              {title}
            </h3>

            <p className="text-gray-400 text-[11px] sm:text-xs mt-1 leading-tight line-clamp-2">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </p>
          </div>

          <div className="mt-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-400 flex items-center justify-center shadow-lg hover:bg-orange-500 transition shrink-0">
            <Plus size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
          </div>
        </div>
      </div>
    </Link>
  );
}
