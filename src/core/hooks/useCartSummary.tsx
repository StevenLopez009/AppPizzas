import { useCart } from "@/context/CartContext";

export const useCartSummary = () => {
  const { cart } = useCart();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return { cartCount };
};
