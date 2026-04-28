import BottomMenu from "@/components/bottomMenu/BottomMenu";
import { Heart, Home, ShoppingCart, User } from "lucide-react";

export default function MobileLayout({
  children,
  cartCount,
  goToLastOrder,
}: any) {
  return (
    <div className="block md:hidden w-full">
      <main className="p-4 pb-20">{children}</main>

      <div className="fixed bottom-0 w-full">
        <BottomMenu
          defaultActive="home"
          items={[
            { id: "home", icon: Home, path: "/" },
            { id: "fav", icon: Heart, onClick: goToLastOrder },
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
