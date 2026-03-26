"use client";
import BottomMenu from "@/components/bottomMenu/BottomMenu";
import FoodHeader from "@/components/ui/header/FoodHeader";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function DashboardClient() {
  const user = useUser();
  const router = useRouter();

  return (
    <div>
      <FoodHeader />
      <BottomMenu />
    </div>
  );
}
