"use client";

import { useState } from "react";
import SignInForm from "@/components/auth/SignInForm";

export default function ProfilePage() {
  const [typeSelected, setTypeSelected] = useState("sign-in");

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md  rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {typeSelected === "sign-in" && (
          <SignInForm setTypeSelected={setTypeSelected} />
        )}

        {typeSelected === "sign-up" && (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-black-600">Registro</h2>
            <button
              onClick={() => setTypeSelected("sign-in")}
              className="text-orange-600 font-bold underline"
            >
              Volver al Login
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
