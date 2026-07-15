"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import imgFactura from "@/assets/images/logo.png";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  size: string;
  category?: string;
  extra?: string | null;
  observations?: string | null;
  additionals?: Array<{ name: string; price: number }> | null;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  payment_method: string;
  cash_amount?: number | null;
  customer_address: string;
  neighborhood: string;
  total: number;
  order_type: "domicilio" | "mesa" | "recoger";
  order_items: OrderItem[];
  delivery_fee?: number;
  discount_percentage?: number;
  subtotal?: number;
}

const styles = StyleSheet.create({
  page: {
    padding: 8,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  // Encabezado principal
  mainHeader: {
    marginBottom: 15,
    textAlign: "center",
  },
  logo: {
    width: 45,
    height: 45,
    alignSelf: "center",
  },
  businessName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    letterSpacing: 1,
  },
  nit: {
    fontSize: 8,
    marginBottom: 3,
    color: "#444",
  },
  address: {
    fontSize: 8,
    marginBottom: 3,
    color: "#444",
  },
  dateOrderContainer: {
    flexDirection: "column",
    marginBottom: 8,
  },
  dateOrderBox: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
  },
  labelText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#333",
  },
  valueText: {
    fontSize: 9,
    color: "#333",
  },
  // Línea separadora
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    marginVertical: 6,
  },
  separatorDashed: {
    borderBottomWidth: 1,
    borderBottomColor: "#999",
    borderStyle: "dashed",
    marginVertical: 6,
  },
  separatorThin: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    marginVertical: 4,
  },
  // Información del pedido
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  infoLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#555",
  },
  infoValue: {
    fontSize: 8,
    color: "#555",
  },
  // Tabla de productos
  productsHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 5,
    marginBottom: 8,
    marginTop: 8,
  },
  headerText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  productRow: {
    flexDirection: "row",
    marginBottom: 6,
    paddingVertical: 2,
  },
  colCant: { width: "12%", fontSize: 9 },
  colProducto: { width: "53%", fontSize: 9 },
  colPrecio: { width: "17%", fontSize: 9, textAlign: "right" },
  colTotal: { width: "18%", fontSize: 9, textAlign: "right" },
  // Producto con observaciones
  productName: {
    fontSize: 9,
    fontWeight: "normal",
  },
  productObs: {
    fontSize: 7,
    color: "#888",
    marginTop: 2,
    marginLeft: 3,
  },
  // Totales
  totalsSection: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 9,
    width: 80,
    textAlign: "right",
    marginRight: 10,
  },
  totalValue: {
    fontSize: 9,
    width: 80,
    textAlign: "right",
  },
  grandTotal: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  // Método de pago
  paymentSection: {
    marginVertical: 8,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  paymentLabel: {
    fontSize: 9,
    fontWeight: "bold",
  },
  paymentValue: {
    fontSize: 9,
  },
  // Cliente
  clientSection: {
    marginVertical: 8,
    padding: 5,
    borderRadius: 3,
  },
  clientTitle: {
    fontWeight: "bold",
    fontSize: 9,
    marginBottom: 5,
  },
  clientRow: {
    fontSize: 8,
    marginBottom: 3,
  },
  // Footer
  footer: {
    marginTop: 15,
    textAlign: "center",
  },
  thanks: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#d35400",
  },
  bankInfo: {
    fontSize: 7,
    marginTop: 8,
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    paddingTop: 8,
  },
  bankTitle: {
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 7,
  },
  bankRow: {
    marginBottom: 2,
    fontSize: 7,
  },
  productBlock: {
    marginBottom: 10,
  },

  productTitle: {
    fontSize: 9,
    fontWeight: "bold",
  },

  productLine: {
    fontSize: 8,
    marginLeft: 6,
    marginTop: 2,
  },

  productTotal: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 4,
  },

  extraTitle: {
    fontSize: 8,
    marginLeft: 6,
    marginTop: 3,
  },

  separatorItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#999",
    marginTop: 8,
  },
});

console.log(imgFactura);

// Función para calcular el total de un item incluyendo additionals
const calculateItemTotal = (item: OrderItem): number => {
  return item.price * item.quantity;
};

// Función para calcular el subtotal total incluyendo todos los additionals
const calculateSubtotal = (order: Order): number => {
  return order.order_items.reduce((sum, item) => {
    return sum + calculateItemTotal(item);
  }, 0);
};

export const InvoicePDF = ({ order }: { order: Order }) => {
  // Calcular el cambio si aplica
  const cambio =
    order.cash_amount && order.cash_amount > order.total
      ? order.cash_amount - order.total
      : 0;

  // Calcular el subtotal incluyendo additionals
  const subtotal = calculateSubtotal(order);

  // Obtener el delivery fee (solo para domicilios)
  const deliveryFee =
    order.order_type === "domicilio" ? order.delivery_fee || 0 : 0;

  // Calcular la base para el descuento (subtotal + domicilio)
  const baseParaDescuento = subtotal + deliveryFee;

  // Calcular el descuento sobre la base (subtotal + domicilio)
  const discountValue = order.discount_percentage
    ? (baseParaDescuento * order.discount_percentage) / 100
    : 0;

  // Calcular el total final
  const totalWithDiscount = baseParaDescuento - discountValue;

  const sortedItems = [...order.order_items].sort((a, b) => {
    const aIsDrink = a.category?.toLowerCase() === "bebidas";
    const bIsDrink = b.category?.toLowerCase() === "bebidas";

    if (aIsDrink === bIsDrink) return 0;

    return aIsDrink ? 1 : -1;
  });

  return (
    <Document>
      <Page
        size={{
          width: 226.77,
          height: 1000,
        }}
        style={styles.page}
      >
        {/* HEADER */}
        <View style={styles.mainHeader}>
          <Text style={styles.businessName}>PIZZAS LA CARRETA</Text>
          <Image style={styles.logo} src={imgFactura.src} />
          <Text style={styles.nit}>NIT: 1032377521</Text>
          <Text style={styles.address}>CRA 21 # 3A SUR -62 SOCIEGO</Text>
          <Text style={styles.address}>Tel: 3192888121</Text>
          <View style={styles.separator} />

          {/* Fecha y Pedido */}
          <View style={styles.dateOrderContainer}>
            <View style={styles.dateOrderBox}>
              <Text style={styles.labelText}>Fecha:</Text>
              <Text style={styles.valueText}>
                {new Date(order.created_at).toLocaleDateString("es-CO")}
              </Text>
            </View>
            <View style={styles.dateOrderBox}>
              <Text style={styles.labelText}>Pedido #:</Text>
              <Text style={styles.valueText}>
                {order.id.slice(0, 8).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />
        </View>

        {/* TABLA DE PRODUCTOS */}
        <View>
          {sortedItems.map((item, index) => {
            const itemTotal = calculateItemTotal(item);

            return (
              <View key={index} style={styles.productBlock} wrap={false}>
                <Text style={styles.productTitle}>
                  {item.quantity}x {item.product_name}
                  {item.size && ` (${item.size})`}
                </Text>

                <Text style={styles.productLine}>
                  Valor unidad: ${item.price.toLocaleString("es-CO")}
                </Text>

                {item.extra && item.extra !== "sin extra" && (
                  <Text style={styles.productLine}>Extra: {item.extra}</Text>
                )}

                {item.additionals && item.additionals.length > 0 && (
                  <>
                    <Text style={styles.extraTitle}>Adicionales:</Text>

                    {item.additionals.map((additional, i) => (
                      <Text key={i} style={styles.productLine}>
                        • {additional.name} (+$
                        {additional.price.toLocaleString("es-CO")})
                      </Text>
                    ))}
                  </>
                )}

                {item.observations && (
                  <Text style={styles.productLine}>
                    Observación: {item.observations}
                  </Text>
                )}

                <Text style={styles.productTotal}>
                  Total: ${itemTotal.toLocaleString("es-CO")}
                </Text>

                <View style={styles.separatorItem} />
              </View>
            );
          })}
        </View>

        <View style={styles.separator} />

        {/* TOTALES */}
        <View style={styles.totalsSection}>
          {/* Subtotal */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              ${subtotal.toLocaleString("es-CO")}
            </Text>
          </View>

          {/* Delivery Fee (solo para domicilios) */}
          {order.order_type === "domicilio" && deliveryFee > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Domicilio:</Text>
              <Text style={styles.totalValue}>
                +${deliveryFee.toLocaleString("es-CO")}
              </Text>
            </View>
          )}

          {/* Base para descuento (subtotal + domicilio) */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Base sin descuento:</Text>
            <Text style={styles.totalValue}>
              ${baseParaDescuento.toLocaleString("es-CO")}
            </Text>
          </View>

          {/* Descuento (si aplica) */}
          {order.discount_percentage && order.discount_percentage > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Descuento ({order.discount_percentage}%):
              </Text>
              <Text style={styles.totalValue}>
                -${discountValue.toLocaleString("es-CO")}
              </Text>
            </View>
          )}

          {/* Total final */}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValue}>
              ${totalWithDiscount.toLocaleString("es-CO")}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* TIPO DE PAGO */}
        <View style={styles.paymentSection}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Tipo de pago:</Text>
            <Text style={styles.paymentValue}>
              {order.payment_method === "efectivo"
                ? "EFECTIVO"
                : "NEQUI/TARJETA"}
            </Text>
          </View>

          {cambio > 0 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Cambio:</Text>
              <Text style={styles.paymentValue}>
                ${cambio.toLocaleString("es-CO")}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.separatorThin} />

        {/* INFORMACIÓN DEL CLIENTE */}
        <View style={styles.clientSection}>
          <Text style={styles.clientTitle}>DATOS DEL CLIENTE</Text>
          <Text style={styles.clientRow}>Nombre: {order.customer_name}</Text>
          <Text style={styles.clientRow}>Teléfono: {order.customer_phone}</Text>
          {order.order_type === "domicilio" && (
            <>
              <Text style={styles.clientRow}>
                Dirección: {order.customer_address}
              </Text>
              <Text style={styles.clientRow}>Barrio: {order.neighborhood}</Text>
            </>
          )}
          {order.order_type === "recoger" && (
            <Text style={styles.clientRow}>Tipo: Recoger en tienda</Text>
          )}
          {order.order_type === "mesa" && (
            <Text style={styles.clientRow}>Tipo: Consumo en mesa</Text>
          )}
        </View>
      </Page>
    </Document>
  );
};
