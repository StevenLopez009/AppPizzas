"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export const useOrders = () => {
  const { cart, updateQuantity, setOrderType } = useCart();
  const router = useRouter();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleOrder = (type: "domicilio" | "recoger" | "mesa") => {
    setOrderType(type);

    if (window.innerWidth < 768) {
      router.push("/orders/checkout");
    }
  };

  return {
    cart,
    total,
    updateQuantity,
    handleOrder,
  };
};
