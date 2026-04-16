import Image from "next/image";
import Link from "next/link";
import PizzaMitades from "../../assets/images/pizzamitades.png";

export default function PizzaSection({
  onSelectCategory,
}: {
  onSelectCategory: (category: string) => void;
}) {
  return (
    <div className="sm:w-full lg:w-full p-2 sm:max-w-7xl ">
      <div className="w-full grid grid-cols-2 grid-rows-2 gap-4 lg:flex lg:flex-nowrap lg:gap-4">
        <Link
          href="/pizza/mitades"
          className="col-span-2 block sm:w-full md:w-[66%] lg:w-[96%]"
        >
          <div className="bg-[#FFEEDB] h-40 rounded-3xl flex items-center justify-between px-8 relative overflow-hidden group cursor-pointer sm:h-48 md:h-52 lg:h-56">
            <div className="z-10">
              <h2 className="text-[#4A2B4D] text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
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

        {/* PIZZA DULCE */}
        <div
          onClick={() => onSelectCategory("Pizza Dulce")}
          className="bg-[#FFEEDB] h-40 rounded-3xl cursor-pointer relative overflow-hidden group px-6 flex items-start sm:w-[48%] md:w-[48%] lg:w-[25%] sm:h-48 md:h-52 lg:h-56"
        >
          <div className="z-10 pt-6 sm:pt-8 md:pt-10">
            <h2 className="text-[#4A2B4D] text-2xl font-bold sm:text-3xl md:text-4xl">
              Pizza <br /> Dulce
            </h2>
          </div>

          <Image
            src={PizzaMitades}
            alt="Pizza dulce"
            className="absolute -bottom-20 -right-15 h-[120%] w-auto object-contain drop-shadow-xl rotate-12 group-hover:rotate-0 transition-transform duration-500 sm:-bottom-24 md:-bottom-28"
          />
        </div>

        {/* PIZZA SAL */}
        <div
          onClick={() => onSelectCategory("Pizza Sal")}
          className="bg-[#FFEEDB] h-40 rounded-3xl cursor-pointer relative overflow-hidden group px-6 flex items-start sm:w-[48%] md:w-[48%] lg:w-[25%] sm:h-48 md:h-52 lg:h-56"
        >
          <div className="z-10 pt-6 sm:pt-8 md:pt-10">
            <h2 className="text-[#4A2B4D] text-2xl font-bold sm:text-3xl md:text-4xl">
              Pizza <br /> de sal
            </h2>
          </div>

          <Image
            src={PizzaMitades}
            alt="Pizza sal"
            className="absolute -bottom-20 -right-15 h-[120%] w-auto object-contain drop-shadow-xl rotate-12 group-hover:rotate-0 transition-transform duration-500 sm:-bottom-24 md:-bottom-28"
          />
        </div>
      </div>
    </div>
  );
}
