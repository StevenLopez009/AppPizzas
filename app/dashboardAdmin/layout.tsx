"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/SideBar/SideBar";
import ReportComponent from "@/components/report/ReportComponent";
import {
  LayoutDashboard,
  PackagePlus,
  ShoppingCart,
  Motorbike,
  Home,
  ChefHat,
  Pizza,
  User,
} from "lucide-react";
import BottomMenu from "@/components/bottomMenu/BottomMenu";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideBottomMenu = pathname.startsWith("/dashboardAdmin/updateProduct/");

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
      id: "orders",
      label: "Pedidos",
      icon: ShoppingCart,
      path: "/dashboardAdmin/orders",
    },
    {
      id: "delivery",
      label: "Domicilios",
      icon: Motorbike,
      path: "/dashboardAdmin/delivery",
    },
  ];

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (data.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        window.location.href = "/dashboard";
      }
    };

    checkAdmin();
  }, []);

  return (
    <div className="md:flex w-full min-h-screen">
      <div className="hidden md:block md:w-[20%]">
        <Sidebar
          menu={adminMenu}
          title="Pizzas La Carreta"
          highlightColor="orange-500"
        />
      </div>
      <main className="w-full md:p-4">{children}</main>
      <div className="hidden md:block md:w-[20%]">
        <ReportComponent />
      </div>
      {!hideBottomMenu && (
        <div className="block md:hidden fixed bottom-0 left-0 w-full">
          <BottomMenu
            defaultActive="home"
            items={[
              { id: "home", icon: Home, path: "/dashboardAdmin" },
              { id: "orders", icon: ChefHat, path: "/dashboardAdmin/orders" },
              { id: "create", icon: Pizza, path: "/dashboardAdmin/create" },
              { id: "profile", icon: User, path: "/profile" },
            ]}
          />
        </div>
      )}
    </div>
  );
}
