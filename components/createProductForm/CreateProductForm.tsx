"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/categories";
import Image from "next/image";
import imgProduct from "@/assets/images/createProduct.jpg";

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
  const [file, setFile] = useState<File | null>(null);

  const isPizza =
    form.category === "Pizza Dulce" || form.category === "Pizza Sal";

  const category = form.category.toLowerCase();
  const isComidaRapida = category.includes("rapida");

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let imageUrl = "";

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;

      const { data, error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file);

      if (uploadError) {
        console.error(uploadError);
        alert("Error subiendo imagen");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    let prices = [];

    if (isPizza) {
      prices = [
        { label: "Personal", price: Number(form.pricePersonal) },
        { label: "Mediana", price: Number(form.priceMediana) },
      ];
    } else if (isComidaRapida) {
      prices = [
        { label: "Sencillo", price: Number(form.pricePersonal) },
        { label: "Doble", price: Number(form.priceMediana) },
      ];
    } else {
      prices = [{ label: "", price: Number(form.price) }];
    }

    const { error } = await supabase.from("products").insert([
      {
        name: form.name,
        description: form.description,
        prices,
        image_url: imageUrl,
        category: form.category,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Error al crear producto");
    } else {
      alert("Producto creado ");
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
      className="w-full mt-10 mx-auto bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2"
    >
      <div className="relative h-60 md:h-auto">
        <Image
          src={imgProduct}
          alt="Producto"
          fill
          className="object-cover object-top md:object-center"
          priority
        />
        <div className="absolute inset-0 flex items-end p-6">
          <h2 className="text-white text-2xl font-bold">
            Crea un nuevo producto
          </h2>
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-5">
        <h2 className="text-2xl font-bold text-gray-800 md:hidden">
          Crear Producto
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Nombre del producto"
          value={form.name}
          onChange={handleChange}
          className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none p-3 rounded-xl transition"
          required
        />

        <textarea
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
          className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none p-3 rounded-xl transition resize-none"
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none p-3 rounded-xl transition"
          required
        >
          <option value="">Selecciona una categoría</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {isPizza || isComidaRapida ? (
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="pricePersonal"
              placeholder={
                isPizza
                  ? "Precio Personal"
                  : isComidaRapida
                    ? "Precio Sencillo"
                    : ""
              }
              value={form.pricePersonal}
              onChange={handleChange}
              className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none p-3 rounded-xl transition"
              required
            />

            <input
              type="number"
              name="priceMediana"
              placeholder={
                isPizza
                  ? "Precio Mediana"
                  : isComidaRapida
                    ? "Precio Doble"
                    : ""
              }
              value={form.priceMediana}
              onChange={handleChange}
              className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none p-3 rounded-xl transition"
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
            className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none p-3 rounded-xl transition"
            required
          />
        )}

        <label className="block">
          <span className="text-sm text-gray-500">Imagen del producto</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full mt-1 border border-dashed border-gray-300 p-3 rounded-xl cursor-pointer hover:border-orange-400 transition"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          Guardar Producto
        </button>
      </div>
    </form>
  );
}
