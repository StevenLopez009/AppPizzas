import { Users } from "lucide-react";
import { getUsersCount } from "@/lib/repos/userPoints";

export async function UsersCounter() {
  const totalUsers = await getUsersCount();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand via-brand/90 to-brand/70 p-6 text-white shadow-xl">
      {/* Decoración */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5" />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">
            Clientes registrados
          </p>

          <h2 className="mt-2 text-5xl font-extrabold tracking-tight">
            {totalUsers}
          </h2>

          <p className="mt-2 text-sm text-white/80">
            Usuarios registrados en la plataforma
          </p>
        </div>

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
          <Users className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
