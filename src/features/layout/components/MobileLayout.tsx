import BottomMenu from "@/components/bottomMenu/BottomMenu";
import { Home, ShoppingCart, ClipboardList, User } from "lucide-react";

export default function MobileLayout({
  children,
  cartCount,
}: any) {
  return (
    <div className="block md:hidden w-full">
      <main className="p-4 pb-20">{children}</main>

      <div className="fixed bottom-0 w-full">
        <BottomMenu
          defaultActive="home"
          items={[
            { id: "home", icon: Home, path: "/dashboard" },
            { id: "my-orders", icon: ClipboardList, path: "/my-orders" },
            {
              id: "orders",
              icon: ShoppingCart,
              path: "/orders",
              badge: cartCount || undefined,
            },
            { id: "profile", icon: User, path: "/profile" },
          ]}
        />
      </div>
    </div>
  );
}
