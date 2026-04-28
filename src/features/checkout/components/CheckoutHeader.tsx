"use client";

import { useRouter } from "next/navigation";

export default function CheckoutHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4 p-6">
      <button
        onClick={() => router.push("/dashboard")}
        className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center"
      >
        ←
      </button>

      <h1 className="text-lg font-bold text-gray-800">Checkout</h1>
    </div>
  );
}
