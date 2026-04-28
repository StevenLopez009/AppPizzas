export function shuffleProducts(products: any[]) {
  return [...products].sort(() => Math.random() - 0.5);
}
