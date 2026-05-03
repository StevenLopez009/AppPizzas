"use client";

import BottomMenu from "@/components/bottomMenu/BottomMenu";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Home, ShoppingCart, ClipboardList, User } from "lucide-react";

export default function MobileLayout({ children, cartCount }: any) {
  return (
    <div className="block md:hidden w-full">
      {/* Top bar with theme toggle */}
      <div className="flex justify-end px-4 pt-3">
        <ThemeToggle iconOnly />
      </div>

      <main className="p-4 pb-24">{children}</main>

      <div className="fixed bottom-0 w-full">
        <BottomMenu
          defaultActive="home"
          items={[
            { id: "home", icon: Home, path: "/dashboard" },
            { id: "my-orders", icon: ClipboardList, path: "/my-orders" },
            { id: "orders", icon: ShoppingCart, path: "/orders", badge: cartCount || undefined },
            { id: "profile", icon: User, path: "/profile" },
          ]}
        />
      </div>
    </div>
  );
}
