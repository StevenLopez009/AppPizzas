"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { menuConfig } from "./MenuConfig";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";
import { useCartSummary } from "@/src/core/hooks/useCartSummary";
import { useLastOrderNavigation } from "@/src/core/navigation/useLastOrderNavigation";
import { api } from "@/lib/api";
import { Gift } from "lucide-react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showOrder, showOrderPage } = useCart();
  const { cartCount } = useCartSummary();
  const [businessName, setBusinessName] = useState("Pizzas La Carreta");
  const [dynamicMenu, setDynamicMenu] = useState(menuConfig);

  useEffect(() => {
    Promise.all([
      api.get<{ businessName: string }>("/api/settings").catch(() => ({})),
      api.get("/api/auth/me").catch(() => null),
    ]).then(([settings, user]) => {
      if (settings?.businessName) {
        setBusinessName(settings.businessName);
      }

      // Si el usuario está autenticado, agregar "Mis Puntos" al menú
      if (user?.user_id) {
        const menu = menuConfig.filter((item) => item.id !== "orders");
        menu.push({
          id: "points",
          label: "Mis Puntos",
          path: "/dashboard/mi-perfil",
          icon: Gift,
        });
        setDynamicMenu(menu);
      } else {
        setDynamicMenu(menuConfig.filter((item) => item.id !== "orders"));
      }
    });
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      <DesktopLayout
        menu={dynamicMenu}
        title={businessName}
        showOrder={showOrder}
        showOrderPage={showOrderPage}
      >
        {children}
      </DesktopLayout>

      <MobileLayout cartCount={cartCount} menu={dynamicMenu}>
        {children}
      </MobileLayout>
    </div>
  );
}
