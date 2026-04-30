"use client";

import AuthForm from "@/components/auth/AuthForm";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const user = useUser();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      {user ? (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-500 text-white rounded"
          >
            Cerrar sesión
          </button>
        </div>
      ) : (
        <AuthForm type="sign-in" />
      )}
    </div>
  );
}
