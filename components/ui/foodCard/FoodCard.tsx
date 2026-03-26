import Image from "next/image";
import Link from "next/link";

type FoodCardProps = {
  id: string;
  image: string;
  title: string;
  size: string;
  price: number;
  category: string;
};

export default function FoodCard({
  id,
  image,
  title,
  size,
  price,
}: FoodCardProps) {
  return (
    <Link href={`/product/${id}`}>
      <div className="w-full h-55 bg-gray-100 rounded-3xl p-5 shadow-sm text-center hover:shadow-md transition cursor-pointer">
        <div className="flex justify-center">
          <Image
            src={image}
            alt={title}
            width={120}
            height={120}
            className="h-25 object-contain"
          />
        </div>

        <div className="mt-1">
          <h3 className="font-semibold text-gray-700 text-lg">{title}</h3>
          <p className="text-gray-400 text-sm mt-1">{size}</p>
          <p className="text-yellow-500 font-bold text-xl mt-3">${price}</p>
        </div>
      </div>
    </Link>
  );
}
