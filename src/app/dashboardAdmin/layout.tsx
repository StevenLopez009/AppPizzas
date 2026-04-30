"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SidebarContainer from "@/src/features/layout/components/SideBarContainer";
import {
  LayoutDashboard,
  PackagePlus,
  ShoppingCart,
  Home,
  ChefHat,
  Pizza,
  User,
  HandPlatter,
} from "lucide-react";

import BottomMenu from "@/components/bottomMenu/BottomMenu";
import { usePathname } from "next/navigation";
import SalesStats from "@/components/report/SalesStats";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const supabase = createClient();

  const [orders, setOrders] = useState([]);

  const hideBottomMenu = pathname.startsWith("/dashboardAdmin/updateProduct/");

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        window.location.href = "/dashboard";
      }
    };

    checkAdmin();
  }, []);

  useEffect(() => {
    const getOrders = async () => {
      const { data, error } = await supabase.from("orders").select(`
          id,
          total,
          created_at,
          payment_method,
          order_type,
          order_items (
            product_name,
            quantity
          )
        `);

      if (!error) {
        setOrders(data || []);
      }
    };

    getOrders();
  }, []);

  const adminMenu = [
    {
      id: "overview",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboardAdmin",
    },
    {
      id: "create",
      label: "Crear Productos",
      icon: PackagePlus,
      path: "/dashboardAdmin/create",
    },
    {
      id: "adittionals",
      label: "Adicionales",
      icon: HandPlatter,
      path: "/dashboardAdmin/adittionals",
    },
    {
      id: "orders",
      label: "Pedidos",
      icon: ShoppingCart,
      path: "/dashboardAdmin/orders",
    },
  ];

  return (
    <div className="md:flex w-full min-h-screen">
      {/* SIDEBAR IZQUIERDO */}
      <div className="hidden md:block md:w-[18%]">
        <SidebarContainer menu={adminMenu} />
      </div>

      {/* CONTENIDO */}
      <main className="w-full md:w-[57%] md:p-4">{children}</main>

      {/* SIDEBAR DERECHO */}
      <div className="hidden xl:block xl:w-[25%] p-4">
        <div className="sticky top-4">
          <SalesStats orders={orders} />
        </div>
      </div>

      {!hideBottomMenu && (
        <div className="block md:hidden fixed bottom-0 left-0 w-full">
          <BottomMenu
            defaultActive="home"
            items={[
              {
                id: "home",
                icon: Home,
                path: "/dashboardAdmin",
              },
              {
                id: "create",
                icon: Pizza,
                path: "/dashboardAdmin/create",
              },
              {
                id: "adittionals",
                icon: HandPlatter,
                path: "/dashboardAdmin/adittionals",
              },
              {
                id: "orders",
                icon: ChefHat,
                path: "/dashboardAdmin/orders",
              },
              {
                id: "profile",
                icon: User,
                path: "/profile",
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
