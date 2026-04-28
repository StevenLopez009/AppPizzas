interface FilterProductsProps {
  foods: any[];
  selectedCategory: string;
  pizzaCategory: string | null;
  search: string;
}

export function filterProducts({
  foods,
  selectedCategory,
  pizzaCategory,
  search,
}: FilterProductsProps) {
  return foods
    .filter((food) => {
      if (selectedCategory === "Todos") return true;

      if (selectedCategory === "Pizza") {
        if (pizzaCategory) {
          return food.category === pizzaCategory;
        }

        return food.category.includes("Pizza");
      }

      return food.category === selectedCategory;
    })
    .filter((food) => food.name.toLowerCase().includes(search.toLowerCase()));
}
