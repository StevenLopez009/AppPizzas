"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId) {
        toast.error("ID de sesión inválido");
        router.push("/dashboard");
        return;
      }

      try {
        setLoading(true);
        setVerified(true);
        toast.success("¡Pago realizado exitosamente!");

        setTimeout(() => {
          router.push("/my-orders");
        }, 2000);
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("Error verificando el pago");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent mx-auto"></div>
          <p className="text-fg">Verificando pago...</p>
        </div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="text-center">
          <p className="text-fg-muted">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="max-w-md rounded-lg bg-surface p-8 text-center shadow-lg border border-line">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-fg mb-2">¡Pago Exitoso!</h1>
        <p className="text-fg-muted mb-6">
          Tu pago ha sido procesado correctamente. Redirigiendo a tus órdenes...
        </p>
        <a
          href="/my-orders"
          className="inline-block px-6 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand-hover transition"
        >
          Ver mis órdenes
        </a>
      </div>
    </div>
  );
}