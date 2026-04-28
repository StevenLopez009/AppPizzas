"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PDFViewer } from "@react-pdf/renderer";
import { useParams, useRouter } from "next/navigation";
import { InvoicePDF } from "@/components/InvoicePDF/InvoicePDF";

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
  customer_phone: string;
  payment_method: string;
  cash_amount?: number | null;
  customer_address: string;
  neighborhood: string;
  lat?: number | null;
  lng?: number | null;
  total: number;
  status: string;
  order_type: "domicilio" | "mesa" | "recoger";
  order_items: OrderItem[];
  delivery_fee?: number;
  subtotal?: number;
  discount_percentage: number;
}

export default function FacturaPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          created_at,
          customer_name,
          customer_phone,
          customer_address,
          payment_method,
          total,
          order_type,
          status,
          neighborhood,
          lat,
          lng,
          cash_amount,
          delivery_fee,
          subtotal,
          discount_percentage,
          order_items (
            id,
            product_name,
            quantity,
            price,
            size,
            extra,
            observations,
            additionals
          )
        `,
        )
        .eq("id", params.id)
        .single();

      if (error) {
        console.log(error);
        router.push("/admin");
      } else {
        setOrder(data as Order);
      }

      setLoading(false);
    };

    if (params.id) {
      getOrder();
    }
  }, [params.id, supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando factura...</p>
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
            onClick={() => router.push("/admin")}
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
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Factura #{order.id.slice(0, 8)}
          </h1>
          <div className="space-x-3">
            <button
              onClick={() => window.print()}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
            >
              🖨️ Imprimir
            </button>
            <button
              onClick={() => router.push("/admin")}
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
            <InvoicePDF order={order} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
