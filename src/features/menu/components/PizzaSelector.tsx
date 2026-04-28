"use client";

import PizzaSection from "@/components/pizzaSection/PizzaSection";

interface Props {
  onSelectCategory: (category: string) => void;
}

export default function PizzaSelector({ onSelectCategory }: Props) {
  return (
    <div className="col-span-full">
      <PizzaSection onSelectCategory={onSelectCategory} />
    </div>
  );
}
