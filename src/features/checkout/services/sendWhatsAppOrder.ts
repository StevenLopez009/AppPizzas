"use client";

interface SendWhatsAppOrderProps {
  cart: any[];
  form: {
    nombre: string;
    telefono: string;
    direccion: string;
    pago: string;
    montoEfectivo: string;
  };
  barrio: string;
  mesa: string;
  total: number;
  domicilio: number;
  location: {
    lat: number;
    lng: number;
  } | null;
  orderType: string;
}

export function sendWhatsAppOrder({
  cart,
  form,
  barrio,
  mesa,
  total,
  domicilio,
  location,
  orderType,
}: SendWhatsAppOrderProps) {
  const items = cart
    .map(
      (item) =>
        `${item.quantity} (${item.size}) ${item.name} - ${
          item.extra || "sin extra"
        } ${
          item.observations ? `- ${item.observations}` : ""
        } - $${(item.price * item.quantity).toLocaleString("es-CO")}`,
    )
    .join("\n");

  const montoEfectivoTexto =
    form.pago === "efectivo" && form.montoEfectivo
      ? `\nPaga con: $${parseInt(form.montoEfectivo).toLocaleString("es-CO")}
Cambio: $${(parseInt(form.montoEfectivo) - total).toLocaleString("es-CO")}`
      : "";

  const message = `
*Nuevo Pedido*

${orderType !== "mesa" ? `Cliente: ${form.nombre}` : ""}
${orderType !== "mesa" ? `Tel: ${form.telefono}` : ""}
${orderType === "mesa" ? `Mesa: ${mesa}` : ""}
${orderType === "domicilio" ? `Dirección: ${form.direccion}` : ""}
${orderType === "domicilio" ? `Barrio: ${barrio}` : ""}

${
  location
    ? `Ubicación: https://www.google.com/maps?q=${location.lat},${location.lng}`
    : ""
}

Tipo: ${orderType}
Pago: ${form.pago}${montoEfectivoTexto}

Pedido:
${items}

Domicilio: $${domicilio.toLocaleString("es-CO")}
Total: $${total.toLocaleString("es-CO")}
`;

  const phone = "573161534971";

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
}
