"use client";

import { useCart } from "@/context/CartContext";
import { menuConfig } from "./MenuConfig";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";
import { useCartSummary } from "@/src/core/hooks/useCartSummary";
import { useLastOrderNavigation } from "@/src/core/navigation/useLastOrderNavigation";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showOrder, showOrderPage } = useCart();
  const { cartCount } = useCartSummary();
  const { goToLastOrder } = useLastOrderNavigation();

  return (
    <div className="w-full overflow-x-hidden">
      <DesktopLayout
        menu={menuConfig}
        showOrder={showOrder}
        showOrderPage={showOrderPage}
      >
        {children}
      </DesktopLayout>

      <MobileLayout cartCount={cartCount} goToLastOrder={goToLastOrder}>
        {children}
      </MobileLayout>
    </div>
  );
}
