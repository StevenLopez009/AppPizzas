"use client";

import { useEffect, useState } from "react";
import SidebarContainer from "@/src/features/layout/components/SideBarContainer";
import {
  LayoutDashboard,
  PackagePlus,
  ClipboardList,
  Home,
  Pizza,
  User,
  HandPlatter,
  Palette,
  Tag,
} from "lucide-react";

import BottomMenu from "@/components/bottomMenu/BottomMenu";
import { usePathname, useRouter } from "next/navigation";
import SalesStats from "@/components/report/SalesStats";
import DevSeedControl from "@/components/dev/DevSeedControl";
import { api, ApiError } from "@/lib/api";
import { useOrdersStream } from "@/lib/realtime/client";

interface OrderSummary {
  id: string;
  total: number;
  discount_percentage: number;
  created_at: string;
  payment_method: string;
  order_type: "domicilio" | "mesa" | "recoger";
  order_items: { product_name: string; quantity: number }[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout", {});
    } catch {
      // cookie se limpia igual
    }
    router.push("/dashboard");
  };

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [businessName, setBusinessName] = useState("Pizzas La Carreta");

  const hideBottomMenu = pathname.startsWith("/dashboardAdmin/updateProduct/");

  useEffect(() => {
    (async () => {
      try {
        const { user } = await api.get<{
          user: { role: "user" | "admin" } | null;
        }>("/api/auth/me");
        if (!user || user.role !== "admin") {
          router.replace("/login");
        }
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          router.replace("/login");
        }
      }
    })();
  }, [router]);

  useEffect(() => {
    (async () => {
      try {
        const { orders } = await api.get<{ orders: OrderSummary[] }>(
          "/api/orders",
        );
        setOrders(orders);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { businessName: name } = await api.get<{ businessName: string }>(
          "/api/settings",
        );
        if (name) setBusinessName(name);
      } catch {
        // keep default
      }
    })();
  }, []);

  useOrdersStream(null, (event) => {
    if (event.type === "order.created" && event.order) {
      const incoming = event.order as OrderSummary;
      setOrders((prev) =>
        prev.find((o) => o.id === incoming.id) ? prev : [incoming, ...prev],
      );
    } else if (event.type === "order.updated" && event.order) {
      const updated = event.order as OrderSummary;
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } else if (event.type === "order.deleted" && event.orderId) {
      setOrders((prev) => prev.filter((o) => o.id !== event.orderId));
    }
  });

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
      icon: ClipboardList,
      path: "/dashboardAdmin/orders",
    },
    {
      id: "categories",
      label: "Categorías",
      icon: Tag,
      path: "/dashboardAdmin/categories",
    },
    {
      id: "appearance",
      label: "Apariencia",
      icon: Palette,
      path: "/dashboardAdmin/appearance",
    },
  ];

  return (
    <div className="md:flex w-full min-h-screen">
      <div className="hidden md:block md:w-[18%]">
        <SidebarContainer menu={adminMenu} title={businessName} onLogout={handleLogout} />
      </div>

      <main className="w-full md:w-[57%] md:p-4">
        <DevSeedControl />
        {children}
      </main>

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
              { id: "home", icon: Home, path: "/dashboardAdmin" },
              { id: "create", icon: Pizza, path: "/dashboardAdmin/create" },
              {
                id: "adittionals",
                icon: HandPlatter,
                path: "/dashboardAdmin/adittionals",
              },
              {
                id: "orders",
                icon: ClipboardList,
                path: "/dashboardAdmin/orders",
              },
              {
                id: "appearance",
                icon: Palette,
                path: "/dashboardAdmin/appearance",
              },
              { id: "profile", icon: User, path: "/profile" },
            ]}
          />
        </div>
      )}
    </div>
  );
}
