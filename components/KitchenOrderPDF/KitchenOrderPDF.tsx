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
  // Encabezado
  header: {
    textAlign: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#d35400",
  },
  orderInfo: {
    fontSize: 9,
    color: "#555",
    marginBottom: 2,
  },
  separator: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    marginVertical: 8,
  },
  separatorDashed: {
    borderBottomWidth: 1,
    borderBottomColor: "#999",
    borderStyle: "dashed",
    marginVertical: 6,
  },
  // Información del pedido
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: "bold",
  },
  infoValue: {
    fontSize: 9,
  },
  // Tabla de productos
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginTop: 2,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  headerText: {
    fontSize: 10,
    fontWeight: "bold",
    margin: 10,
  },
  productRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  productRowAlt: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    backgroundColor: "#fafafa",
  },
  colCant: { width: "12%", fontSize: 10 },
  colProducto: { width: "58%", fontSize: 10 },
  colObs: { width: "30%", fontSize: 9 },
  // Producto con detalles
  productName: {
    fontSize: 10,
    fontWeight: "bold",
  },
  productDetails: {
    fontSize: 9,
    color: "#666",
    marginTop: 2,
  },
  observationText: {
    fontSize: 9,
    color: "#888",
    fontStyle: "italic",
  },
  // Footer
  footer: {
    marginTop: 20,
    textAlign: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#999",
    marginTop: 5,
  },
  urgent: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ff0000",
    textAlign: "center",
    marginTop: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: "#ff0000",
  },
});

export const KitchenOrderPDF = ({ order }: { order: Order }) => {
  return (
    <Document>
      <Page size={[210, 297]} style={styles.page}>
        {/* INFORMACIÓN BÁSICA */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fecha:</Text>
          <Text style={styles.infoValue}>
            {new Date(order.created_at).toLocaleString("es-CO", {
              day: "2-digit",
              month: "2-digit",
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
          <Text style={styles.infoValue}>
            {order.order_type === "domicilio"
              ? "DOMICILIO"
              : order.order_type === "recoger"
                ? "RECOGER"
                : "MESA"}
          </Text>
        </View>

        <View style={styles.separatorDashed} />

        {/* TABLA DE PRODUCTOS */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.colCant]}>Cant</Text>
          <Text style={[styles.headerText, styles.colProducto]}>Producto</Text>
          <Text style={[styles.headerText, styles.colObs]}>Observaciones</Text>
        </View>

        {order.order_items?.map((item, index) => (
          <View
            key={index}
            style={index % 2 === 0 ? styles.productRow : styles.productRowAlt}
          >
            <Text style={styles.colCant}>
              {item.quantity}
              {item.size}
            </Text>
            <View style={styles.colProducto}>
              <Text style={styles.productName}>{item.product_name}</Text>
              {item.extra && item.extra !== "sin extra" && (
                <Text style={styles.productDetails}>Borde: {item.extra}</Text>
              )}
              {item.additionals && item.additionals.length > 0 && (
                <Text style={styles.productDetails}>
                  +{item.additionals.map((a) => a.name).join(", ")}
                </Text>
              )}
            </View>
            <Text style={styles.colObs}>
              {item.observations ? ` ${item.observations}` : "-"}
            </Text>
          </View>
        ))}

        {/* NOTAS ADICIONALES */}
        {order.order_items?.some((item) => item.observations) && (
          <View>
            <Text style={{ fontSize: 9, fontWeight: "bold", marginTop: 10 }}>
              Notas importantes:
            </Text>
            {order.order_items.map(
              (item, idx) =>
                item.observations && (
                  <Text
                    key={idx}
                    style={{ fontSize: 8, marginTop: 3, color: "#d35400" }}
                  >
                    • {item.product_name}: {item.observations}
                  </Text>
                ),
            )}
          </View>
        )}
      </Page>
    </Document>
  );
};
