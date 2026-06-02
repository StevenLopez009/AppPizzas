"use client";

import imgDelivery from "@/assets/images/bannerDelivery.png";
import imgPickup from "@/assets/images/image.jpg";

export default function CheckoutLocationCard({
  orderType,
  location,
  locating,
  savedLocation,
  getLocation,
  saveLocation,
  clearSavedLocation,
  sendRestaurantLocation,
}: any) {
  return (
    <div className="px-6">
      <div className="rounded-3xl overflow-hidden shadow bg-brand-surface-muted h-44">
        {orderType === "domicilio" ? (
          <div
            className="relative h-full flex items-center"
            style={{
              backgroundImage: `linear-gradient(to right, #fde7d8 1%, transparent), url(${imgDelivery.src})`,
              backgroundSize: "100% 100%, contain",
              backgroundPosition: "left, right center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="px-5 max-w-[72%]">
              {/* Estado 1: sin ubicación */}
              {!location && (
                <>
                  <p className="text-sm font-semibold text-black">
                    Comparte tu ubicación para un envío más rápido
                  </p>
                  <button
                    type="button"
                    onClick={() => getLocation(false)}
                    disabled={locating}
                    className="mt-3 bg-brand-hover text-white px-4 py-2 rounded-xl disabled:opacity-60 text-sm"
                  >
                    {locating ? "Obteniendo…" : "📍 Obtener ubicación"}
                  </button>
                </>
              )}

              {/* Estado 2: ubicación obtenida pero no guardada */}
              {location && !savedLocation && (
                <>
                  <p className="text-sm font-semibold text-black">✓ Ubicación obtenida</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                  <button
                    type="button"
                    onClick={saveLocation}
                    className="mt-2 bg-brand text-white px-4 py-1.5 rounded-xl text-xs font-semibold"
                  >
                    💾 Guardar para próximos pedidos
                  </button>
                </>
              )}

              {/* Estado 3: ubicación guardada cargada */}
              {location && savedLocation && (
                <>
                  <p className="text-sm font-semibold text-black">📍 Ubicación guardada</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => getLocation(true)}
                      disabled={locating}
                      className="text-xs bg-white/80 text-gray-700 px-3 py-1.5 rounded-lg disabled:opacity-60"
                    >
                      {locating ? "…" : "Actualizar"}
                    </button>
                    <button
                      type="button"
                      onClick={clearSavedLocation}
                      className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div
            className="relative h-full flex items-center"
            style={{
              backgroundImage: `linear-gradient(to right, #fde7d8 1%, transparent), url(${imgPickup.src})`,
              backgroundSize: "100% 100%, contain",
              backgroundPosition: "left, right center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="px-5 max-w-[70%]">
              <p className="text-sm font-semibold text-black">
                Recoge tu pedido en el restaurante
              </p>
              <button
                type="button"
                onClick={sendRestaurantLocation}
                className="mt-3 bg-brand-hover text-white px-4 py-2 rounded-xl text-sm"
              >
                📍 Nuestra ubicación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
