/**
 * Mantengo la firma anterior para no romper `useCheckout`, pero los items
 * ahora se crean en una sola transacción dentro de `createOrder` (POST /api/orders).
 * Esta función queda como no-op.
 */
export async function createOrderItems(_orderId: string, _cart: unknown[]) {
  return;
}
