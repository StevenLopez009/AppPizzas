import { api, ApiError } from "@/lib/api";

export async function getUserRole(): Promise<boolean> {
  try {
    const { user } = await api.get<{ user: { role?: string } | null }>(
      "/api/auth/me",
    );
    return user?.role === "admin";
  } catch (e) {
    if (e instanceof ApiError) return false;
    throw e;
  }
}
