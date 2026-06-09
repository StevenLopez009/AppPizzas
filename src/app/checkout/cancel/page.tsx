"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CheckoutCancelPage() {
  const router = useRouter();

  const handleRetry = () => {
    router.push("/checkout");
  };

  const handleDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="max-w-md rounded-lg bg-surface p-8 text-center shadow-lg border border-line">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-fg mb-2">Pago Cancelado</h1>
        <p className="text-fg-muted mb-6">
          El pago ha sido cancelado. Tu orden sigue guardada y puedes intentar de nuevo.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand-hover transition"
          >
            Intentar de nuevo
          </button>
          <button
            onClick={handleDashboard}
            className="px-6 py-3 bg-canvas text-fg border border-line rounded-lg font-semibold hover:bg-surface transition"
          >
            Volver al menú
          </button>
        </div>
      </div>
    </div>
  );
}
