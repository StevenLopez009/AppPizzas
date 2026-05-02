import { api } from "@/lib/api";

export async function getProductById(id: string) {
  try {
    const { product } = await api.get<{ product: unknown }>(
      `/api/products/${encodeURIComponent(id)}`,
    );
    return product;
  } catch {
    return null;
  }
}
