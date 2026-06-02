"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import imgProduct from "@/assets/images/createProduct.jpg";
import { uploadImageToCloudinary } from "@/lib/storage/cloudinary";
import { api, ApiError } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ProductPrice {
  size: string;
  price: number;
}

export default function CreateProductForm() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    image_url: "",
    category_id: "",
  });

  const [prices, setPrices] = useState<ProductPrice[]>([
    { size: "", price: 0 },
  ]);

  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api
      .get<{ categories: { id: string; name: string }[] }>("/api/categories")
      .then(({ categories }) => setCategories(categories))
      .catch(() => {});
  }, []);

  const selectedCategory = categories.find(
    (cat) => cat.id === form.category_id,
  );
  const categoryName = selectedCategory?.name.toLowerCase() || "";

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePriceChange = (
    index: number,
    field: keyof ProductPrice,
    value: string,
  ) => {
    const newPrices = [...prices];
    if (field === "price") {
      newPrices[index][field] = parseFloat(value) || 0;
    } else {
      newPrices[index][field] = value;
    }
    setPrices(newPrices);
  };

  const addPriceField = () => {
    setPrices([...prices, { size: "", price: 0 }]);
  };

  const removePriceField = (index: number) => {
    if (prices.length > 1) {
      const newPrices = prices.filter((_, i) => i !== index);
      setPrices(newPrices);
    } else {
      toast.error("Debe tener al menos un tamaño/precio");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validar que todos los tamaños tengan nombre y precio
      const invalidPrices = prices.some((p) => !p.size.trim() || p.price <= 0);
      if (invalidPrices) {
        toast.error("Completa todos los tamaños y precios correctamente");
        setSubmitting(false);
        return;
      }

      let imageUrl = "";
      if (file) {
        imageUrl = await uploadImageToCloudinary(file);
      }

      // Filtrar precios vacíos
      const validPrices = prices.filter((p) => p.size.trim() && p.price > 0);

      await api.post("/api/products", {
        name: form.name,
        description: form.description,
        prices: validPrices,
        image_url: imageUrl,
        category_id: form.category_id,
        category: selectedCategory?.name || "",
      });

      toast.success("Producto creado");

      // Resetear formulario
      setForm({
        name: "",
        description: "",
        image_url: "",
        category_id: "",
      });
      setPrices([{ size: "", price: 0 }]);
      setFile(null);
    } catch (err) {
      console.error(err);
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Error al crear producto";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldCls =
    "w-full border border-line bg-canvas text-fg placeholder:text-fg-subtle focus:border-brand-ring focus:ring-2 focus:ring-brand-ring outline-none p-3 rounded-xl transition";

  // Sugerencias de tamaños según categoría
  const getSizeSuggestions = (): string[] => {
    if (categoryName.includes("pizza")) {
      return ["Personal", "Mediana", "Grande", "Familiar"];
    } else if (
      categoryName.includes("hamburguesa") ||
      categoryName.includes("rapida")
    ) {
      return ["Sencillo", "Doble", "Mixta"];
    } else if (categoryName.includes("bebida")) {
      return ["Agua", "Leche", "1/2 L", "1 L", "1.5 L", "2 L"];
    } else {
      return ["Único", "Pequeño", "Mediano", "Grande"];
    }
  };

  const sizeSuggestions = getSizeSuggestions();

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mt-10 mx-auto bg-surface border border-line rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2"
    >
      <div className="relative h-60 md:h-auto">
        <Image
          src={imgProduct}
          alt="Producto"
          fill
          className="object-cover object-top md:object-center"
          priority
        />
        <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-black/60 to-transparent rounded-l-3xl">
          <h2 className="text-white text-2xl font-bold">
            Crea un nuevo producto
          </h2>
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-5">
        <h2 className="text-2xl font-bold text-fg md:hidden">Crear Producto</h2>

        <input
          type="text"
          name="name"
          placeholder="Nombre del producto"
          value={form.name}
          onChange={handleChange}
          className={fieldCls}
          required
        />

        <textarea
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
          className={`${fieldCls} resize-none`}
          rows={3}
        />

        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          className={fieldCls}
          required
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Sección de Tamaños y Precios Dinámicos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-fg">
              Tamaños y Precios
            </label>
            <button
              type="button"
              onClick={addPriceField}
              className="text-brand hover:text-brand-hover transition flex items-center gap-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              Agregar tamaño
            </button>
          </div>

          {prices.map((price, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                {/* Input de tamaño con sugerencias */}
                <input
                  type="text"
                  placeholder="Tamaño (ej: Personal, Mediano...)"
                  value={price.size}
                  onChange={(e) =>
                    handlePriceChange(index, "size", e.target.value)
                  }
                  list={`size-suggestions-${index}`}
                  className={fieldCls}
                  required
                />
                <datalist id={`size-suggestions-${index}`}>
                  {sizeSuggestions.map((suggestion) => (
                    <option key={suggestion} value={suggestion} />
                  ))}
                </datalist>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Precio"
                  value={price.price || ""}
                  onChange={(e) =>
                    handlePriceChange(index, "price", e.target.value)
                  }
                  className={fieldCls}
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => removePriceField(index)}
                className="p-3 text-red-500 hover:text-red-700 transition"
                title="Eliminar tamaño"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <label className="block">
          <span className="text-sm text-fg-muted">Imagen del producto</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full mt-1 border border-dashed border-line p-3 rounded-xl cursor-pointer hover:border-brand-ring text-fg-muted transition"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-60"
        >
          {submitting ? "Guardando…" : "Guardar Producto"}
        </button>
      </div>
    </form>
  );
}
