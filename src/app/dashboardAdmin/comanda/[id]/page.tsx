"use client";

import { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { useParams, useRouter } from "next/navigation";
import { KitchenOrderPDF } from "@/components/KitchenOrderPDF/KitchenOrderPDF";
import { api } from "@/lib/api";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  size: string;
  extra?: string | null;
  observations?: string | null;
  additionals?: Array<{ name: string; price: number }> | null;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  order_type: "domicilio" | "mesa" | "recoger";
  order_items: OrderItem[];
}

export default function ComandaPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;
    (async () => {
      try {
        const { order } = await api.get<{ order: Order }>(
          `/api/orders/${encodeURIComponent(String(params.id))}`,
        );
        if (!cancelled) setOrder(order);
      } catch (e) {
        console.log(e);
        router.push("/dashboardAdmin/orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando comanda...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">No se encontró la orden</p>
          <button
            onClick={() => router.push("/dashboardAdmin/orders")}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Comanda #{order.id.slice(0, 8)}
          </h1>
          <div className="space-x-3">
            <button
              onClick={() => window.print()}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
            >
              Imprimir
            </button>
            <button
              onClick={() => router.push("/dashboardAdmin/orders")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            >
              ← Volver
            </button>
          </div>
        </div>

        <div
          className="bg-white rounded-lg shadow-lg overflow-hidden"
          style={{ height: "80vh" }}
        >
          <PDFViewer width="100%" height="100%">
            <KitchenOrderPDF order={order} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
