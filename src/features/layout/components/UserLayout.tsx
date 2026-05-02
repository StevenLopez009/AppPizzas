"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { menuConfig } from "./MenuConfig";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";
import { useCartSummary } from "@/src/core/hooks/useCartSummary";
import { useLastOrderNavigation } from "@/src/core/navigation/useLastOrderNavigation";
import { api } from "@/lib/api";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showOrder, showOrderPage } = useCart();
  const { cartCount } = useCartSummary();
  const [businessName, setBusinessName] = useState("Pizzas La Carreta");

  useEffect(() => {
    api
      .get<{ businessName: string }>("/api/settings")
      .then(({ businessName: name }) => {
        if (name) setBusinessName(name);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      <DesktopLayout
        menu={menuConfig.filter((item) => item.id !== "orders")}
        title={businessName}
        showOrder={showOrder}
        showOrderPage={showOrderPage}
      >
        {children}
      </DesktopLayout>

      <MobileLayout cartCount={cartCount}>
        {children}
      </MobileLayout>
    </div>
  );
}
