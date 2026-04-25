"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  size: string;
  extra?: string | null;
  observations?: string | null;
  additionals?: Array<{ name: string; price: number }> | null;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  order_type: "domicilio" | "mesa" | "recoger";
  order_items: OrderItem[];
}

const styles = StyleSheet.create({
  page: {
    padding: 15,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  // Información del pedido
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },
  infoValue: {
    fontSize: 10,
  },
  separatorDashed: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderStyle: "dashed",
    marginVertical: 8,
  },
  // Estructura de Columna Única
  itemContainer: {
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  productHeader: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 2,
  },
  quantityText: {
    fontSize: 11,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 3,
  },
  productName: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  detailText: {
    fontSize: 9,
    color: "#444",
    marginLeft: 20, // Alineado debajo del nombre, dejando espacio a la cantidad
    marginTop: 1,
  },
  observationBox: {
    marginTop: 4,
    marginLeft: 20,
    padding: 4,
    backgroundColor: "#fff4e5",
    borderLeftWidth: 2,
    borderLeftColor: "#d35400",
  },
  observationText: {
    fontSize: 9,
    color: "#d35400",
    fontWeight: "bold",
  },
});

export const KitchenOrderPDF = ({ order }: { order: Order }) => {
  return (
    <Document>
      {/* Ajusté el tamaño a un ancho de ticket típico (80mm aprox) o puedes dejarlo A4 */}
      <Page size="A4" style={styles.page}>
        {/* ENCABEZADO */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ORDEN: #{order.id.slice(-4)}</Text>
          <Text style={styles.infoValue}>
            {new Date(order.created_at).toLocaleString("es-CO", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cliente:</Text>
          <Text style={styles.infoValue}>{order.customer_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tipo:</Text>
          <Text style={[styles.infoValue, { fontWeight: "bold" }]}>
            {order.order_type.toUpperCase()}
          </Text>
        </View>

        <View style={styles.separatorDashed} />

        {/* LISTA DE PRODUCTOS EN UNA COLUMNA */}
        {order.order_items?.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            {/* Línea principal: Cantidad y Nombre */}
            <View style={styles.productHeader}>
              <Text style={styles.quantityText}>{item.quantity}x</Text>
              <Text style={styles.productName}>
                {item.product_name} ({item.size})
              </Text>
            </View>

            {/* Detalles de Extras */}
            {item.extra && item.extra !== "sin extra" && (
              <Text style={styles.detailText}>•(b) {item.extra}</Text>
            )}

            {/* Detalles de Adicionales */}
            {item.additionals && item.additionals.length > 0 && (
              <Text style={styles.detailText}>
                • Adic: {item.additionals.map((a) => a.name).join(", ")}
              </Text>
            )}

            {/* Observaciones destacadas */}
            {item.observations && (
              <View style={styles.observationBox}>
                <Text style={styles.observationText}>
                  NOTA: {item.observations}
                </Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.separatorDashed} />

        <Text style={{ textAlign: "center", fontSize: 8, marginTop: 10 }}>
          --- Fin de Comanda ---
        </Text>
      </Page>
    </Document>
  );
};
