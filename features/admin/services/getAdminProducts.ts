import { getProducts } from "@/lib/products";

export async function getAdminProducts() {
  return await getProducts();
}
