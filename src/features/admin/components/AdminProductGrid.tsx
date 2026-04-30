import FoodCard from "@/components/ui/foodCard/FoodCard";

interface Props {
  foods: any[];
  isAdmin: boolean;
}

export default function AdminProductGrid({ foods, isAdmin }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {foods.map((food) => (
        <FoodCard
          key={food.id}
          id={food.id}
          image={food.image_url}
          title={food.name}
          size="--"
          price={food.price}
          category={food.category}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}
