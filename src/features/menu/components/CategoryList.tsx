"use client";

import { categories } from "../constants/categories";

interface Props {
  selectedCategory: string;
  onSelect: (category: string) => void;
  onResetPizza: () => void;
}

export default function CategoryList({
  selectedCategory,
  onSelect,
  onResetPizza,
}: Props) {
  return (
    <div className="w-full mt-5">
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar">
        {categories.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              onSelect(item.name);

              if (item.name === "Pizza") {
                onResetPizza();
              }
            }}
            className={`
              min-w-[120px]
              lg:min-w-full
              rounded-2xl
              px-4
              py-3
              text-center
              shadow-sm
              transition
              active:scale-95

              ${
                selectedCategory === item.name
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-700"
              }
            `}
          >
            <p className="text-sm font-medium">{item.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
