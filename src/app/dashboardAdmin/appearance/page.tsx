"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api, ApiError } from "@/lib/api";
import { applyBrandTheme } from "@/lib/theme/brandCssVars";

export default function AppearanceAdminPage() {
  const [hex, setHex] = useState("#F97316");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ themePrimary: string; businessName: string }>(
          "/api/settings",
        );
        setHex(data.themePrimary);
        setBusinessName(data.businessName);
        applyBrandTheme(data.themePrimary);
      } catch {
        toast.error("No se pudo cargar la configuración");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      const data = await api.patch<{ themePrimary: string; businessName: string }>(
        "/api/settings",
        { themePrimary: hex, businessName },
      );
      applyBrandTheme(data.themePrimary);
      toast.success("Configuración guardada");
    } catch (e) {
      if (e instanceof ApiError) toast.error(e.message);
      else toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-4 text-gray-400">Cargando…</p>;
  }

  return (
    <div className="max-w-lg p-4 md:p-0">
      <h1 className="text-2xl font-bold text-white mb-2">Apariencia</h1>
      <p className="text-gray-400 text-sm mb-6">
        Personaliza el nombre y el color principal de la app.
      </p>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-5">
        {/* Nombre del negocio */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300 block">
            Nombre del negocio
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Pizzas La Carreta"
            maxLength={60}
            className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-ring"
          />
          <p className="text-xs text-gray-500">
            Aparece en la barra lateral del panel de administración.
          </p>
        </div>

        {/* Color */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300 block">Color principal</label>
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="color"
              value={hex.startsWith("#") ? hex : `#${hex}`}
              onChange={(e) => setHex(e.target.value.toUpperCase())}
              className="h-12 w-20 cursor-pointer rounded-lg border border-white/20 bg-transparent"
              aria-label="Selector de color principal"
            />
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value.toUpperCase())}
              className="flex-1 min-w-[8rem] rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white font-mono uppercase tracking-wide outline-none focus:ring-2 focus:ring-brand-ring"
              placeholder="#F97316"
              maxLength={7}
              spellCheck={false}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="w-full rounded-xl bg-brand py-3 font-semibold text-white shadow-md transition hover:bg-brand-hover active:bg-brand-active disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
