"use client";

import { useEffect, useState } from "react";
import SidebarContainer from "@/src/features/layout/components/SideBarContainer";
import {
  LayoutDashboard,
  PackagePlus,
  ClipboardList,
  Home,
  Pizza,
  HandPlatter,
  Palette,
  Tag,
  ChefHat,
  MoreHorizontal,
  X,
  LogOut,
  User,
  Map,
  Sun,
  Moon,
  Gift,
  PizzaIcon,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { usePathname, useRouter } from "next/navigation";
import SalesStats from "@/components/report/SalesStats";
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

function AdminMobileMenu({ onLogout }: { onLogout: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const primary = [
    { id: "home", icon: Home, path: "/dashboardAdmin", label: "Inicio" },
    {
      id: "orders",
      icon: ClipboardList,
      path: "/dashboardAdmin/orders",
      label: "Pedidos",
    },
    {
      id: "create",
      icon: Pizza,
      path: "/dashboardAdmin/create",
      label: "Crear",
    },
  ];

  const secondary = [
    {
      id: "adittionals",
      icon: HandPlatter,
      path: "/dashboardAdmin/adittionals",
      label: "Adicionales",
    },
    {
      id: "categories",
      icon: Tag,
      path: "/dashboardAdmin/categories",
      label: "Categorías",
    },
    {
      id: "borders",
      icon: PizzaIcon,
      path: "/dashboardAdmin/borders",
      label: "Bordes",
    },

    {
      id: "appearance",
      icon: Palette,
      path: "/dashboardAdmin/appearance",
      label: "Apariencia",
    },
    {
      id: "points",
      icon: Gift,
      path: "/dashboardAdmin/points",
      label: "Puntos",
    },
    {
      id: "calculadora",
      icon: ChefHat,
      path: "/dashboardAdmin/calculadora",
      label: "Calculadora",
    },
    {
      id: "mapa",
      icon: Map,
      path: "/dashboardAdmin/mapa",
      label: "Mapa mesas",
    },
    { id: "profile", icon: User, path: "/profile", label: "Perfil" },
  ];

  const navigate = (path: string) => {
    setDrawerOpen(false);
    router.push(path);
  };

  return (
    <>
      {/* Bottom bar */}
      <div className="block md:hidden fixed bottom-0 left-0 w-full z-40">
        <div className="mx-4 mb-4 bg-surface rounded-3xl shadow-xl px-4 py-3 flex justify-around items-center border border-line">
          {primary.map(({ id, icon: Icon, path, label }) => {
            const isActive = pathname === path;
            return (
              <button
                key={id}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-1"
              >
                <Icon
                  size={22}
                  className={isActive ? "text-brand" : "text-fg-subtle"}
                />
                <span
                  className={`text-[10px] ${isActive ? "text-brand font-semibold" : "text-fg-subtle"}`}
                >
                  {label}
                </span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-1"
          >
            <MoreHorizontal size={22} className="text-fg-subtle" />
            <span className="text-[10px] text-fg-subtle">Más</span>
          </button>
        </div>
      </div>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 w-full bg-surface rounded-t-3xl p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-fg text-base">Menú</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-xl bg-surface-muted text-fg-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {secondary.map(({ id, icon: Icon, path, label }) => {
                const isActive = pathname === path;
                return (
                  <button
                    key={id}
                    onClick={() => navigate(path)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition ${
                      isActive
                        ? "bg-brand/10 text-brand"
                        : "bg-surface-muted text-fg-muted hover:bg-line-muted"
                    }`}
                  >
                    <Icon size={22} />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-surface-muted text-fg-muted font-semibold text-sm"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {theme === "dark" ? "Modo claro" : "Modo oscuro"}
            </button>

            <button
              onClick={() => {
                setDrawerOpen(false);
                onLogout();
              }}
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400 font-semibold text-sm"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </>
  );
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
          router.replace("/profile");
        }
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          router.replace("/profile");
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
      id: "borders",
      label: "Bordes",
      icon: PizzaIcon,
      path: "/dashboardAdmin/borders",
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
      id: "points",
      label: "Puntos",
      icon: Gift,
      path: "/dashboardAdmin/points",
    },
    {
      id: "appearance",
      label: "Apariencia",
      icon: Palette,
      path: "/dashboardAdmin/appearance",
    },
    {
      id: "calculadora",
      label: "Calculadora",
      icon: ChefHat,
      path: "/dashboardAdmin/calculadora",
    },
    {
      id: "mapa",
      label: "Mapa mesas",
      icon: Map,
      path: "/dashboardAdmin/mapa",
    },
  ];

  return (
    <div className="md:flex w-full min-h-screen">
      <div className="hidden md:block md:w-[18%]">
        <SidebarContainer
          menu={adminMenu}
          title={businessName}
          onLogout={handleLogout}
        />
      </div>

      <main className="w-full md:w-[57%] md:p-4">{children}</main>

      <div className="hidden xl:block xl:w-[25%] p-4">
        <div className="sticky top-4">
          <SalesStats orders={orders} />
        </div>
      </div>

      {!hideBottomMenu && <AdminMobileMenu onLogout={handleLogout} />}
    </div>
  );
}
