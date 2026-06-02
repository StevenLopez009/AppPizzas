import { api } from "@/lib/api";

export async function getAdditionals(category: string) {
  let dbCategory = "";
  const normalized = category.toLowerCase();

  if (normalized.includes("pizza")) {
    dbCategory = "pizza";
  } else if (normalized.includes("lasagna") || normalized.includes("lasaña")) {
    dbCategory = "lasagna";
  } else if (normalized.includes("com")) {
    dbCategory = "Com. Rapidas";
  }

  if (!dbCategory) return [];

  try {
    const { additionals } = await api.get<{ additionals: unknown[] }>(
      `/api/additionals?active=1&category=${encodeURIComponent(dbCategory)}`,
    );
    return additionals;
  } catch (e) {
    console.error(e);
    return [];
  }
}
