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
  recibido: "Pedido recibido",
  cocinando: "En preparación",
  enviado: "En camino",
  entregado: "Entregado",
  listo_para_recoger: "Listo para recoger",
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  recibido: "Hemos recibido tu pedido",
  cocinando: "Estamos preparando tu comida",
  enviado: "Tu pedido va en camino",
  entregado: "Pedido entregado con éxito",
  listo_para_recoger: "Puedes pasar a recoger tu pedido",
};

function OrderTrackingTime({ status, orderType }: Props) {
  const steps = ORDER_FLOW[orderType];
  const currentIndex = steps.indexOf(status);

  const isFinished = status === "entregado" || status === "listo_para_recoger";

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <span className="bg-gray-100 text-gray-600 text-xs px-4 py-1 rounded-full">
          Seguimiento
        </span>

        <span className="flex items-center gap-2 text-sm font-medium">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isFinished ? "bg-green-500" : "bg-orange-500 animate-pulse"
            }`}
          />
          {isFinished ? "Finalizado" : "En progreso"}
        </span>
      </div>

      {/* TIMELINE */}
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-200" />

        <div className="space-y-8">
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step} className="flex items-start gap-4 relative">
                {/* ICON */}
                <div
                  className={`
                    w-8 h-8 flex items-center justify-center rounded-full border-2 z-10
                    ${
                      isCompleted
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "bg-white border-gray-300"
                    }
                    ${isCurrent && !isFinished ? "scale-110 shadow-lg" : ""}
                    transition-all duration-300
                  `}
                >
                  {isCompleted ? "✓" : ""}
                </div>

                {/* CONTENT */}
                <div className="flex-1">
                  <h4
                    className={`font-semibold ${
                      isCompleted ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {STATUS_LABELS[step]}
                  </h4>

                  <p
                    className={`text-sm ${
                      isCompleted ? "text-gray-500" : "text-gray-300"
                    }`}
                  >
                    {STATUS_DESCRIPTIONS[step]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default OrderTrackingTime;
