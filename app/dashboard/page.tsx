"use client";
import BottomMenu from "@/components/bottomMenu/BottomMenu";
import FoodHeader from "@/components/ui/header/FoodHeader";
import { Home, Heart, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function DashboardClient() {
  const { cart } = useCart();
  const router = useRouter();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div>
      <FoodHeader />
      <BottomMenu
        defaultActive="home"
        items={[
          { id: "home", icon: Home, path: "/" },

          {
            id: "fav",
            icon: Heart,
            onClick: () => {
              const lastOrderId = localStorage.getItem("last_order_id");

              if (lastOrderId) {
                router.push(`/pedido/${lastOrderId}`);
              } else {
                alert("No tienes pedidos activos");
              }
            },
          },

          {
            id: "orders",
            icon: ShoppingCart,
            path: "/orders",
            badge: cartCount > 0 ? cartCount : undefined,
          },
          { id: "profile", icon: User, path: "/profile" },
        ]}
      />
    </div>
  );
}
