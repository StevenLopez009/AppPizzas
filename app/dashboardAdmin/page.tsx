"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboard() {
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

  return <div>Admin Dashboard</div>;
}
