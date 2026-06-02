import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import OrderTrackingTime from "@/components/orderTrackingTime/OrderTrackingTime";

describe("OrderTrackingTime", () => {
  it("muestra los 4 pasos para domicilio y marca el actual", () => {
    render(<OrderTrackingTime status="cocinando" orderType="domicilio" />);

    expect(screen.getByText("Pedido recibido")).toBeInTheDocument();
    expect(screen.getByText("En preparación")).toBeInTheDocument();
    expect(screen.getByText("En camino")).toBeInTheDocument();
    expect(screen.getByText("Entregado")).toBeInTheDocument();
    expect(screen.getByText("En progreso")).toBeInTheDocument();
  });

  it("indica Finalizado cuando el pedido está entregado", () => {
    render(<OrderTrackingTime status="entregado" orderType="mesa" />);
    expect(screen.getByText("Finalizado")).toBeInTheDocument();
    expect(screen.getByText("Entregado")).toBeInTheDocument();
  });

  it("para recoger usa listo_para_recoger como paso final", () => {
    render(<OrderTrackingTime status="listo_para_recoger" orderType="recoger" />);
    expect(screen.getByText("Listo para recoger")).toBeInTheDocument();
    expect(screen.getByText("Finalizado")).toBeInTheDocument();
  });

  it("solo en domicilio muestra el botón final", () => {
    const { rerender } = render(
      <OrderTrackingTime status="recibido" orderType="domicilio" />,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();

    rerender(<OrderTrackingTime status="recibido" orderType="mesa" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
