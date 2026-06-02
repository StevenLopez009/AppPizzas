import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export const useLastOrderNavigation = () => {
  const router = useRouter();

  const goToLastOrder = () => {
    const lastOrderId = localStorage.getItem("last_order_id");

    if (lastOrderId) {
      router.push(`/pedido/${lastOrderId}`);
    } else {
      toast("No tienes pedidos activos", { icon: "📭" });
    }
  };

  return { goToLastOrder };
};
