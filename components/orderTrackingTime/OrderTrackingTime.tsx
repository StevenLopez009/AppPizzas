"use client";

interface Props {
  status: string;
  orderType: "domicilio" | "mesa" | "recoger";
}

const ORDER_FLOW = {
  domicilio: ["recibido", "cocinando", "enviado", "entregado"],
  mesa: ["recibido", "cocinando", "entregado"],
  recoger: ["recibido", "cocinando", "listo_para_recoger"],
};

const STATUS_LABELS: Record<string, string> = {
  recibido: "Recibido",
  cocinando: "Preparando",
  enviado: "En camino",
  entregado: "Entregado",
  listo_para_recoger: "Listo",
};

const STATUS_ICONS: Record<string, string> = {
  recibido: "📋",
  cocinando: "👨‍🍳",
  enviado: "🛵",
  entregado: "✅",
  listo_para_recoger: "🏁",
};

function OrderTrackingTime({ status, orderType }: Props) {
  const steps = ORDER_FLOW[orderType];
  const currentIndex = steps.indexOf(status);
  const isFinished = status === "entregado" || status === "listo_para_recoger";

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <span className="bg-gray-100 text-gray-600 text-xs px-4 py-1.5 rounded-full font-medium">
          Seguimiento
        </span>
        <span className="flex items-center gap-2 text-sm font-medium">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isFinished ? "bg-green-500" : "bg-brand animate-pulse"
            }`}
          />
          {isFinished ? "Finalizado" : "En progreso"}
        </span>
      </div>

      {/* Stepper */}
      <div className="flex items-start">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          const isLast = index === steps.length - 1;

          return (
            <div key={step} className="flex items-start flex-1 last:flex-none">
              {/* Step column */}
              <div className="flex flex-col items-center flex-1">
                {/* Circle */}
                <div
                  className={`
                    relative w-12 h-12 rounded-full flex items-center justify-center text-lg
                    border-2 transition-all duration-500 z-10
                    ${
                      isCompleted
                        ? "bg-brand border-brand text-white shadow-md"
                        : isCurrent
                        ? "bg-white border-brand text-brand shadow-lg scale-110 ring-4 ring-brand/20"
                        : "bg-gray-50 border-gray-200 text-gray-300"
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className={isPending ? "grayscale opacity-40" : ""}>
                      {STATUS_ICONS[step]}
                    </span>
                  )}
                  {/* Pulse ring for current step */}
                  {isCurrent && !isFinished && (
                    <span className="absolute inset-0 rounded-full border-2 border-brand animate-ping opacity-30" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`mt-2 text-xs font-semibold text-center leading-tight max-w-[60px] ${
                    isCompleted || isCurrent ? "text-gray-800" : "text-gray-300"
                  }`}
                >
                  {STATUS_LABELS[step]}
                </span>
              </div>

              {/* Connector line (between steps) */}
              {!isLast && (
                <div className="flex-1 h-[2px] mt-6 mx-1 rounded-full overflow-hidden bg-gray-200">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-700"
                    style={{ width: isCompleted ? "100%" : isCurrent ? "50%" : "0%" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current status description */}
      <div
        className={`mt-6 px-4 py-3 rounded-2xl text-sm font-medium text-center ${
          isFinished
            ? "bg-green-50 text-green-700"
            : "bg-brand-surface text-brand-text"
        }`}
      >
        {
          {
            recibido: "Hemos recibido tu pedido y lo estamos procesando",
            cocinando: "Estamos preparando tu comida con cariño",
            enviado: "Tu pedido va en camino, ¡ya casi llega!",
            entregado: "¡Tu pedido fue entregado! Buen provecho 🎉",
            listo_para_recoger: "Tu pedido está listo, puedes pasar a recogerlo 🏁",
          }[status] ?? "Procesando tu pedido..."
        }
      </div>
    </div>
  );
}

export default OrderTrackingTime;
