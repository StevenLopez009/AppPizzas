"use client";
import FoodHeader from "@/components/ui/header/FoodHeader";
import { QuickPointsCard } from "@/features/user/components/QuickPointsCard";

export default function DashboardClient() {
  return (
    <div className="space-y-6">
      <FoodHeader />
      <div className="px-4 md:px-0">
        <QuickPointsCard />
      </div>
    </div>
  );
}
