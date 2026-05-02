"use client";

import { useState, useEffect } from "react";

const FORM_KEY = "saved_checkout_form";

interface SavedForm {
  nombre: string;
  telefono: string;
  direccion: string;
  barrio: string;
}

function loadSavedForm(): SavedForm | null {
  try {
    const raw = localStorage.getItem(FORM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useCheckoutForm() {
  const [barrio, setBarrioState] = useState("");
  const [mesa, setMesa] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    pago: "efectivo",
    montoEfectivo: "",
  });

  // Load saved form data on mount
  useEffect(() => {
    const saved = loadSavedForm();
    if (saved) {
      setForm((prev) => ({
        ...prev,
        nombre: saved.nombre ?? "",
        telefono: saved.telefono ?? "",
        direccion: saved.direccion ?? "",
      }));
      if (saved.barrio) setBarrioState(saved.barrio);
    }
  }, []);

  const persistForm = (updatedForm: typeof form, updatedBarrio: string) => {
    const toSave: SavedForm = {
      nombre: updatedForm.nombre,
      telefono: updatedForm.telefono,
      direccion: updatedForm.direccion,
      barrio: updatedBarrio,
    };
    localStorage.setItem(FORM_KEY, JSON.stringify(toSave));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => {
      const updated = { ...prev, [e.target.name]: e.target.value };
      persistForm(updated, barrio);
      return updated;
    });
  };

  const setBarrio = (value: string) => {
    setBarrioState(value);
    persistForm(form, value);
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
