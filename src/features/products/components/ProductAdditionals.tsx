"use client";

import { CircleX } from "lucide-react";

interface Props {
  additionals: any[];
  selectedAdditionals: any[];
  onToggle: (additional: any) => void;
}

export default function ProductAdditionals({
  additionals,
  selectedAdditionals,
  onToggle,
}: Props) {
  return (
    <div className="mb-5">
      <h3 className="font-bold text-gray-800 mb-3">Ingredientes adicionales</h3>

      <div className="grid grid-cols-2 gap-2">
        {additionals.map((additional) => {
          const isSelected = selectedAdditionals.some(
            (item) => item.name === additional.name,
          );

          return (
            <button
              type="button"
              key={additional.id || additional.name}
              onClick={() => onToggle(additional)}
              className={`
                p-3 rounded-xl text-left transition-all active:scale-95
                ${
                  isSelected
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              <div className="font-medium text-sm">{additional.name}</div>

              <div className="text-xs mt-1 opacity-80">
                +$
                {additional.price.toLocaleString("es-CO")}
              </div>
            </button>
          );
        })}
      </div>

      {selectedAdditionals.length > 0 && (
        <div className="mt-4 p-3 bg-orange-50 rounded-2xl">
          <p className="text-xs font-semibold text-orange-600 mb-2">
            Ingredientes seleccionados
          </p>

          <div className="flex flex-wrap gap-2">
            {selectedAdditionals.map((item) => (
              <span
                key={item.name}
                className="
                  bg-white px-3 py-1 rounded-full text-sm
                  flex items-center gap-2 shadow-sm
                "
              >
                {item.name}

                <button
                  type="button"
                  onClick={() => onToggle(item)}
                  className="text-gray-500 hover:text-red-500 transition"
                >
                  <CircleX size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
