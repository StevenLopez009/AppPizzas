"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PackagePlus,
  ShoppingCart,
  BarChart3,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menu = [
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
      id: "sales",
      label: "Ventas",
      icon: BarChart3,
      path: "/sales",
    },
  ];

  return (
    <>
      <aside
        className={`fixed md:static top-0 left-0 h-screen w-[260px] bg-white rounded-r-3xl p-6 shadow-md z-50 transform transition-transform duration-300`}
      >
        {/* Header móvil */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-xl font-semibold text-gray-700">
            Pizzas<span className="text-orange-500"> La Carreta</span>
          </h1>
        </div>

        <nav className="flex flex-col gap-3">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <button
                key={item.id}
                onClick={() => {
                  router.push(item.path);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
                  ${
                    isActive
                      ? "bg-white text-orange-500 shadow-sm"
                      : "text-gray-400 hover:bg-white hover:text-gray-600"
                  }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
