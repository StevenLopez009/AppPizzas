"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/SideBar/SideBar";
import ReportComponent from "@/components/report/ReportComponent";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <div>
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 h-20">{children}</main>
      <div className="hidden md:block">
        <ReportComponent />
      </div>
    </div>
  );
}
