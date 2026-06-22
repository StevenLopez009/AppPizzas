"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api, ApiError } from "@/lib/api";
import { applyBrandTheme } from "@/lib/theme/brandCssVars";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import Image from "next/image";
import imageClose from "../../../../assets/images/apariencia.jpg";

export default function AppearanceAdminPage() {
  const [hex, setHex] = useState("#F97316");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeOpen, setStoreOpen] = useState(true);

  const { theme, toggleTheme, setBrand } = useTheme();
  const { setStoreOpen: setGlobalStoreOpen } = useSettings();

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{
          themePrimary: string;
          businessName: string;
          storeOpen: boolean;
        }>("/api/settings");

        setStoreOpen(data.storeOpen);
        const color = data.themePrimary || "#F97316";
        setHex(color);
        setBusinessName(data.businessName);
        setBrand(color);
        applyBrandTheme(color);
      } catch {
        toast.error("No se pudo cargar la configuración");
      } finally {
        setLoading(false);
      }
    })();
  }, [setBrand]);

  const onSave = async () => {
    setSaving(true);
    try {
      const data = await api.patch<{
        themePrimary: string;
        businessName: string;
        storeOpen: boolean;
      }>("/api/settings", {
        themePrimary: hex,
        businessName,
        storeOpen,
      });

      // Actualizar contexto + CSS
      setBrand(data.themePrimary);
      applyBrandTheme(data.themePrimary);
      setStoreOpen(data.storeOpen);

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
    <div className="p-4 md:p-0">
      <h1 className="text-2xl font-bold text-white mb-2">Apariencia</h1>
      <p className="text-gray-400 text-sm mb-6">
        Personaliza el nombre y el color principal de la app.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* === Formulario (Izquierda) === */}
        <div className="space-y-6">
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
              <label className="text-sm text-gray-300 block">
                Color principal
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <input
                  type="color"
                  value={hex.startsWith("#") ? hex : `#${hex}`}
                  onChange={(e) => setHex(e.target.value.toUpperCase())}
                  className="h-12 w-20 cursor-pointer rounded-lg border border-white/20 bg-transparent"
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

          {/* Dark mode */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-300 mb-3">Modo de visualización</p>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white hover:bg-white/10 transition"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              <span className="flex-1 text-left">
                {theme === "dark" ? "Modo claro" : "Modo oscuro"}
              </span>
              <span className="text-xs text-gray-400 capitalize">
                {theme === "dark" ? "Activo: oscuro" : "Activo: claro"}
              </span>
            </button>
          </div>

          {/* Recepción de pedidos */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Recepción de pedidos</p>
                <p className="text-xs text-gray-400">
                  Habilita o bloquea pedidos para clientes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStoreOpen((prev) => !prev)}
                className={`relative h-8 w-16 rounded-full transition ${
                  storeOpen ? "bg-green-500" : "bg-red-500"
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                    storeOpen ? "left-9" : "left-1"
                  }`}
                />
              </button>
            </div>

            <p
              className={`mt-3 text-sm font-semibold ${
                storeOpen ? "text-green-400" : "text-red-400"
              }`}
            >
              {storeOpen ? "La tienda está abierta" : "La tienda está cerrada"}
            </p>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="h-full rounded-3xl overflow-hidden border border-white/10 bg-white/5 flex flex-col">
            <div className="relative flex-1 min-h-[300px]">
              <Image
                src={imageClose}
                alt="Pizzería cerrada"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-white">
                Estado de la tienda
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Cuando la recepción de pedidos esté desactivada, los clientes no
                podrán realizar nuevas órdenes.
              </p>

              <div
                className={`mt-4 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  storeOpen
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {storeOpen ? "🟢 Abierta" : "🔴 Cerrada"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
