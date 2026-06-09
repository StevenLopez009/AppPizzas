"use client";

import BottomMenu from "@/components/bottomMenu/BottomMenu";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { ShoppingCart } from "lucide-react";

export default function MobileLayout({ children, cartCount, menu }: any) {
  // Construir items del menú bottom a partir del menú dinámico
  const bottomMenuItems = menu
    .filter((item: any) => item.id !== "orders") // Filtrar 'orders' que se agrega especialmente
    .map((item: any) => ({
      id: item.id,
      icon: item.icon,
      path: item.path,
    }))
    .concat({
      id: "orders",
      icon: ShoppingCart,
      path: "/orders",
      badge: cartCount || undefined,
    });

  return (
    <div className="block md:hidden w-full">
      <div className="relative flex items-center justify-center px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-fg">La Carreta</h1>
        <div className="absolute right-4">
          <ThemeToggle iconOnly />
        </div>
      </div>

      <main className="p-4 pb-24">{children}</main>

      <div className="fixed bottom-0 w-full">
        <BottomMenu defaultActive="home" items={bottomMenuItems} />
      </div>
    </div>
  );
}
