import Image from "next/image";
import Link from "next/link";
import PizzaMitades from "../../assets/images/pizzamitades.png";

export default function PizzaSection() {
  return (
    <div className="w-90 p-2">
      <div className="w-full max-w-4xl grid grid-cols-2 grid-rows-2 gap-4">
        <Link href="/pizza/mitades" className="col-span-2 block">
          <div className="bg-[#FFEEDB] h-40 rounded-3xl flex items-center justify-between px-8 relative overflow-hidden group cursor-pointer">
            <div className="z-10">
              <h2 className="text-[#4A2B4D] text-2xl font-bold leading-tight">
                Pizza <br /> por mitades
              </h2>
            </div>

            <div className="relative h-full w-1/2 flex items-center justify-end">
              <Image
                src={PizzaMitades}
                alt="Tomato Pizza"
                fill
                className="h-[140%] object-contain drop-shadow-2xl transform rotate-12 group-hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>
        </Link>

        <div className="bg-gray-300 h-40 rounded-xl"></div>

        <div className="bg-gray-300 h-40 rounded-xl"></div>
      </div>
    </div>
  );
}
