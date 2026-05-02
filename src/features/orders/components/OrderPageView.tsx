import OrderTrackingTime from "@/components/orderTrackingTime/OrderTrackingTime";
import { ShoppingBasket } from "lucide-react";

type OrderType = "domicilio" | "mesa" | "recoger";

interface Props {
  status: string | null;
  orderType: OrderType | null;
  onGoHome: () => void;
}

export default function OrderPageView({ status, orderType, onGoHome }: Props) {
  if (!status || !orderType) {
    return <p className="p-10 text-center">Cargando pedido...</p>;
  }

  if (status === "entregado" || status === "listo_para_recoger") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <ShoppingBasket size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          No tienes Ordenes activas
        </h2>
        <p className="text-gray-500 mt-2 mb-6">Crea un pedido delicioso</p>
        <button
          onClick={onGoHome}
          className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-orange-200"
        >
          Ver Menú
        </button>
      </div>
    );
  }

  return (
    <div className="p-10">
      <OrderTrackingTime status={status} orderType={orderType} />
    </div>
  );
}
