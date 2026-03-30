"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/categories";

export default function CreateProductForm() {
  const supabase = createClient();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    pricePersonal: "",
    priceMediana: "",
    image_url: "",
    category: "",
  });

  const isPizza =
    form.category === "Pizza Dulce" || form.category === "Pizza Sal";

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const prices = [
      {
        label: "Único",
        price: Number(form.price),
      },
    ];

    const { error } = await supabase.from("products").insert([
      {
        name: form.name,
        description: form.description,
        prices,
        image_url: form.image_url,
        category: form.category,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error al crear producto");
    } else {
      alert("Producto creado 🚀");
      setForm({
        name: "",
        description: "",
        price: "",
        pricePersonal: "",
        priceMediana: "",
        image_url: "",
        category: "",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg bg-white p-6 rounded-2xl shadow-md space-y-4"
    >
      <h2 className="text-xl font-semibold">Crear Producto</h2>

      <input
        type="text"
        name="name"
        placeholder="Nombre"
        value={form.name}
        onChange={handleChange}
        className="w-full border p-3 rounded-xl"
        required
      />

      <textarea
        name="description"
        placeholder="Descripción"
        value={form.description}
        onChange={handleChange}
        className="w-full border p-3 rounded-xl"
      />

      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="w-full border p-3 rounded-xl"
        required
      >
        <option value="">Selecciona una categoría</option>

        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {isPizza ? (
        <div className="flex gap-3">
          <input
            type="number"
            name="pricePersonal"
            placeholder="Precio Personal"
            value={form.pricePersonal}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
            required
          />

          <input
            type="number"
            name="priceMediana"
            placeholder="Precio Mediana"
            value={form.priceMediana}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
            required
          />
        </div>
      ) : (
        <input
          type="number"
          name="price"
          placeholder="Precio"
          value={form.price}
          onChange={handleChange}
          className="w-full border p-3 rounded-xl"
          required
        />
      )}

      <input
        type="text"
        name="image_url"
        placeholder="URL de imagen"
        value={form.image_url}
        onChange={handleChange}
        className="w-full border p-3 rounded-xl"
      />

      <button
        type="submit"
        className="w-full bg-orange-500 text-white py-3 rounded-xl"
      >
        Guardar Producto
      </button>
    </form>
  );
}
