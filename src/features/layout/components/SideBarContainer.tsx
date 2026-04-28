"use client";

import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/src/components/ui/SideBar";

interface Props {
  menu: any[];
  title?: string;
  highlightColor?: string;
}

export default function SidebarContainer({
  menu,
  title = "Pizzas La Carreta",
  highlightColor = "orange-500",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Sidebar
      menu={menu}
      activePath={pathname}
      onNavigate={(path) => router.push(path)}
      title={title}
      highlightColor={highlightColor}
    />
  );
}
