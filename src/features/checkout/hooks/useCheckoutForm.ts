"use client";

import { useState } from "react";

export function useCheckoutForm() {
  const [barrio, setBarrio] = useState("");
  const [mesa, setMesa] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    pago: "efectivo",
    montoEfectivo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return {
    form,
    setForm,

    barrio,
    setBarrio,

    mesa,
    setMesa,

    handleChange,
  };
}
