"use client";

import AuthForm from "@/components/auth/AuthForm";
import { useUser } from "@/context/UserContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const user = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // ignore
    }
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      {user ? (
        <div className="flex flex-col items-center gap-4">
          <p>Sesión activa: {user.email}</p>
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
