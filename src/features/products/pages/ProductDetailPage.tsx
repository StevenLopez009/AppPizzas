"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

import ProductGallery from "../components/ProductGallery";
import ProductInfo from "../components/ProductInfo";
import ProductSizeSelector from "../components/ProductSizeSelector";
import ProductBorderSelector from "../components/ProductBorderSelector";
import ProductAdditionals from "../components/ProductAdditionals";
import ProductObservation from "../components/ProductObservation";
import ProductFooter from "../components/ProductFooter";

interface Props {
  product: any;
  additionals: any[];
}

export default function ProductDetailPage({ product, additionals }: Props) {
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState(product.prices[0]);

  const [selectedBorder, setSelectedBorder] = useState("");

  const [selectedAdditionals, setSelectedAdditionals] = useState<any[]>([]);

  const [observations, setObservations] = useState("");

  const additionalsPrice = selectedAdditionals.reduce(
    (acc, item) => acc + item.price,
    0,
  );

  const totalPrice = selectedSize.price + additionalsPrice;

  const toggleAdditional = (additional: any) => {
    setSelectedAdditionals((prev) => {
      const exists = prev.find((item) => item.name === additional.name);

      if (exists) {
        return prev.filter((item) => item.name !== additional.name);
      }

      return [...prev, additional];
    });
  };

  const handleAddToCart = () => {
    addToCart({
      id: crypto.randomUUID(),
      product_id: product.id,
      name: product.name,
      image: product.image_url,
      quantity: 1,
      price: totalPrice,
      size: selectedSize.label,
      extra: selectedBorder,
      additionals: selectedAdditionals,
      observations,
    });
  };

  return (
    <div className="max-w-7xl mx-auto min-h-screen bg-white">
      <div className="md:grid md:grid-cols-2 md:gap-8">
        <ProductGallery product={product} />

        <div className="p-5">
          <ProductInfo product={product} />

          <ProductSizeSelector
            prices={product.prices}
            selectedSize={selectedSize}
            onSelect={setSelectedSize}
          />

          {product.category?.toLowerCase().includes("pizza") && (
            <ProductBorderSelector
              value={selectedBorder}
              onChange={setSelectedBorder}
            />
          )}

          <ProductAdditionals
            additionals={additionals}
            selectedAdditionals={selectedAdditionals}
            onToggle={toggleAdditional}
          />

          <ProductObservation value={observations} onChange={setObservations} />

          <ProductFooter price={totalPrice} onAdd={handleAddToCart} />
        </div>
      </div>
    </div>
  );
}
