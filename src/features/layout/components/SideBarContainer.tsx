"use client";

import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/src/components/ui/SideBar";

interface Props {
  menu: any[];
  title?: string;
  onLogout?: () => void;
}

export default function SidebarContainer({
  menu,
  title = "Pizzas La Carreta",
  onLogout,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Sidebar
      menu={menu}
      activePath={pathname}
      onNavigate={(path) => router.push(path)}
      onLogout={onLogout}
      title={title}
    />
  );
}
