"use client";

import { useRouter } from "next/navigation";

export default function CheckoutHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4 p-6">
      <button
        onClick={() => router.push("/dashboard")}
        className="w-10 h-10 rounded-full bg-surface shadow border border-line flex items-center justify-center text-fg-muted hover:bg-surface-muted transition"
      >
        ←
      </button>

      <h1 className="text-lg font-bold text-fg">Checkout</h1>
    </div>
  );
}
