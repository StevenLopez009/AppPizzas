"use client";
import BottomMenu from "@/components/bottomMenu/BottomMenu";
import FoodHeader from "@/components/ui/header/FoodHeader";
import { Home, Heart, ShoppingCart, User } from "lucide-react";

export default function DashboardClient() {
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
                window.location.href = `/pedido/${lastOrderId}`;
              } else {
                alert("No tienes pedidos activos");
              }
            },
          },

          { id: "orders", icon: ShoppingCart, path: "/orders" },
          { id: "profile", icon: User, path: "/profile" },
        ]}
      />
    </div>
  );
}
