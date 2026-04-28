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
    .map(
      (item: any) =>
        `${item.quantity}x ${item.name} - $${(
          item.price * item.quantity
        ).toLocaleString("es-CO")}`,
    )
    .join("\n");

  return `
*Nuevo Pedido*

${orderType !== "mesa" ? `Cliente: ${form.nombre}` : ""}
${orderType !== "mesa" ? `Tel: ${form.telefono}` : ""}
${orderType === "mesa" ? `Mesa: ${mesa}` : ""}
${orderType === "domicilio" ? `Dirección: ${form.direccion}` : ""}
${orderType === "domicilio" ? `Barrio: ${barrio}` : ""}

${
  location
    ? `Ubicación:
https://www.google.com/maps?q=${location.lat},${location.lng}`
    : ""
}

Pedido:
${items}

Domicilio:
$${domicilio.toLocaleString("es-CO")}

Total:
$${total.toLocaleString("es-CO")}
`;
}
