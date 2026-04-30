"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import SidebarContainer from "@/src/features/layout/components/SideBarContainer";
import ReportComponent from "@/components/report/ReportComponent";
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
        <SidebarContainer menu={adminMenu} />
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
