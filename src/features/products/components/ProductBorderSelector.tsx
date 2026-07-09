"use client";

import { useEffect, useState } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

interface Border {
  id: string;
  name: string;
}

export default function ProductBorderSelector({ value, onChange }: Props) {
  const [borders, setBorders] = useState<Border[]>([]);

  useEffect(() => {
    const loadBorders = async () => {
      try {
        const response = await fetch("/api/borders");
        const data = await response.json();
        setBorders(data.borders);
      } catch (err) {
        console.error("Error cargando bordes", err);
      }
    };

    loadBorders();
  }, []);

  return (
    <div className="mb-5">
      <h3 className="font-bold text-fg mb-3">Bordes de la Pizza</h3>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line rounded-2xl p-3 bg-surface-muted text-fg outline-none focus:ring-2 focus:ring-brand-ring"
      >
        <option value="">Selecciona un borde</option>

        {borders.map((border) => (
          <option key={border.id} value={border.name}>
            {border.name}
          </option>
        ))}
      </select>
    </div>
  );
}
