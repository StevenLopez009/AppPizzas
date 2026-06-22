export function generateWhatsAppMessage({
  cart,
  form,
  total,
  domicilio,
  barrio,
  mesa,
  orderType,
  location,
}: any) {
  const items = cart
    .map((item: any) => {
      const extra = item.extra
        ? `\n   ▸ ${item.extra.replaceAll("_", " ")}`
        : "";

      const adicionales =
        item.additionals?.length > 0
          ? `\n   ▸ Adicionales: ${item.additionals
              .map((a: any) => a.name)
              .join(", ")}`
          : "";

      const observaciones = item.observations
        ? `\n   ▸ Observaciones: ${item.observations}`
        : "";

      return `${item.quantity}x ${item.name}${item.size ? ` (${item.size})` : ""}
   $${(item.price * item.quantity).toLocaleString("es-CO")}
${extra}${adicionales}${observaciones}`;
    })
    .join("\n\n");

  return `
*🍕 Nuevo Pedido*

${orderType !== "mesa" ? `👤 Cliente: ${form.nombre}` : ""}
${orderType !== "mesa" ? `📞 Tel: ${form.telefono}` : ""}
${orderType === "mesa" ? `🪑 Mesa: ${mesa}` : ""}
${orderType === "domicilio" ? `📍 Dirección: ${form.direccion}` : ""}
${orderType === "domicilio" ? `🏘️ Barrio: ${barrio}` : ""}

${
  location
    ? `📌 Ubicación:
https://www.google.com/maps?q=${location.lat},${location.lng}`
    : ""
}

*Pedido:*
${items}

🚚 Domicilio:
$${domicilio.toLocaleString("es-CO")}

💰 Total:
$${total.toLocaleString("es-CO")}
`;
}
