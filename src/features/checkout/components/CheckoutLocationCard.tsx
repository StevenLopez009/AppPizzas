"use client";

import imgDelivery from "@/assets/images/bannerDelivery.png";
import imgPickup from "@/assets/images/image.jpg";

export default function CheckoutLocationCard({
  orderType,
  location,
  getLocation,
  sendRestaurantLocation,
}: any) {
  return (
    <div className="px-6">
      <div className="rounded-3xl overflow-hidden shadow bg-orange-100 h-40">
        {orderType === "domicilio" ? (
          <div
            className="relative h-full flex items-center"
            style={{
              backgroundImage: `
                linear-gradient(to right, #fde7d8 1%, transparent),
                url(${imgDelivery.src})
              `,
              backgroundSize: "100% 100%, contain",
              backgroundPosition: "left, right center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="px-5 max-w-[70%]">
              {!location ? (
                <>
                  <p className="text-sm font-semibold text-black">
                    Comparte tu ubicación para un envio mas rapido
                  </p>

                  <button
                    onClick={getLocation}
                    className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-xl"
                  >
                    Compartir
                  </button>
                </>
              ) : (
                <p className="font-bold text-black">Ubicación compartida</p>
              )}
            </div>
          </div>
        ) : (
          <div
            className="relative h-full flex items-center"
            style={{
              backgroundImage: `
                linear-gradient(to right, #fde7d8 1%, transparent),
                url(${imgPickup.src})
              `,
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
                onClick={sendRestaurantLocation}
                className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-xl"
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
