"use client";

import BottomMenu from "@/components/bottomMenu/BottomMenu";
import FoodHeader from "@/components/ui/header/FoodHeader";
import { Home, Heart, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/SideBar/SideBar";
import ReportComponent from "@/components/report/ReportComponent";
import CartSummary from "@/components/cartSummary/CartSummary";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { cart } = useCart();
  const router = useRouter();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const menu = [
    { id: "home", label: "Home", path: "/", icon: Home },
    { id: "orders", label: "Pedidos", path: "/orders", icon: ShoppingCart },
    { id: "profile", label: "Perfil", path: "/profile", icon: User },
  ];

  return (
    <div className="w-full max-w-screen overflow-x-hidden">
      {/* Desktop layout */}
      <div className="hidden md:grid w-full grid-cols-[250px_1fr_350px]">
        <div>
          <Sidebar menu={menu} title="Pizzas La Carreta" />
        </div>
        <main className="min-w-0 p-4 overflow-x-auto">{children}</main>
        <div className="h-screen overflow-y-auto border-l">
          <CartSummary />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="block md:hidden w-full">
        <main className="w-full min-w-0 p-4 pb-20 overflow-x-auto">
          {children}
        </main>

        <div className="fixed bottom-0 left-0 w-full">
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
      </div>
    </div>
  );
}
