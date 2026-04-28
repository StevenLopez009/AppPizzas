import { useRouter } from "next/navigation";

export const useLastOrderNavigation = () => {
  const router = useRouter();

  const goToLastOrder = () => {
    const lastOrderId = localStorage.getItem("last_order_id");

    if (lastOrderId) {
      router.push(`/pedido/${lastOrderId}`);
    } else {
      alert("No tienes pedidos activos");
    }
  };

  return { goToLastOrder };
};
