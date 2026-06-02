"use client";

import FoodCard from "@/components/ui/foodCard/FoodCard";

interface Props {
  foods: any[];
}

export default function ProductGrid({ foods }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
      {foods.map((food) => (
        <FoodCard
          key={food.id}
          id={food.id}
          image={food.image_url}
          title={food.name}
          size="--"
          price={food.price}
          category={food.category}
          description={food.description}
        />
      ))}
    </div>
  );
}
