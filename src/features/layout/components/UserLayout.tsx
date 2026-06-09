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
  const [dynamicMenu, setDynamicMenu] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Obtener settings y usuario en paralelo
        const [settingsRes, userRes] = await Promise.all([
          api.get<{ businessName: string }>("/api/settings").catch(() => ({})),
          api.get<any>("/api/auth/me").catch(() => null),
        ]);

        // Actualizar nombre del negocio
        if (settingsRes?.businessName) {
          setBusinessName(settingsRes.businessName);
        }

        // Construir menú basado en si está autenticado
        const baseMenu = menuConfig.filter((item) => item.id !== "orders");

        if (userRes?.user_id) {
          // Usuario autenticado: agregar "Mis Puntos"
          setDynamicMenu([
            ...baseMenu,
            {
              id: "points",
              label: "Mis Puntos",
              path: "/dashboard/mi-perfil",
              icon: Gift,
            },
          ]);
        } else {
          // Usuario no autenticado
          setDynamicMenu(baseMenu);
        }

        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading user layout data:", error);
        setDynamicMenu(menuConfig.filter((item) => item.id !== "orders"));
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Mostrar skeleton mientras carga
  if (!isLoaded) {
    return (
      <div className="w-full overflow-x-hidden">
        <DesktopLayout
          menu={[]}
          title={businessName}
          showOrder={showOrder}
          showOrderPage={showOrderPage}
        >
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-muted rounded w-1/3" />
            <div className="h-32 bg-surface-muted rounded" />
          </div>
        </DesktopLayout>
      </div>
    );
  }

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
