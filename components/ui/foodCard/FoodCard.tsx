import Image from "next/image";

type FoodCardProps = {
  image: string;
  title: string;
  size: string;
  price: number;
  category: string;
};

export default function FoodCard({ image, title, size, price }: FoodCardProps) {
  return (
    <div className="w-[100%] h-55 bg-gray-100 rounded-3xl p-5 shadow-sm text-center hover:shadow-md transition cursor-pointer">
      <div className="flex justify-center">
        <Image src={image} alt={title} className=" h-25 object-contain" />
      </div>
      <div className="mt-1">
        <h3 className="font-semibold text-gray-700 text-lg">{title}</h3>
        <p className="text-gray-400 text-sm mt-1">{size}</p>
        <p className="text-yellow-500 font-bold text-xl mt-3">${price}</p>
      </div>
    </div>
  );
}
