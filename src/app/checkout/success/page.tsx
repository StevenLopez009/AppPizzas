import { Suspense } from "react";
import SuccessContent from "./success-content";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent mx-auto"></div>
        <p className="text-fg">Verificando pago...</p>
      </div>
    </div>
  );
}
