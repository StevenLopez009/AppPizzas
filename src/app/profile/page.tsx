"use client";

import { useState } from "react";
import SignInForm from "@/components/auth/SignInForm";

export default function ProfilePage() {
  const [typeSelected, setTypeSelected] = useState<
    "sign-up" | "sign-in" | "recover-password"
  >("sign-in");

  return (
    <main>
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
    </main>
  );
}
