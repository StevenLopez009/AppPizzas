import { api } from "@/lib/api";

export async function getProducts() {
  try {
    const { products } = await api.get<{ products: unknown[] }>("/api/products");
    return products;
  } catch (e) {
    console.log(e);
    return [];
  }
}
