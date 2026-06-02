import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderPageView from "@/src/features/orders/components/OrderPageView";

describe("OrderPageView", () => {
  it("muestra estado de carga si no hay status u orderType", () => {
    render(<OrderPageView status={null} orderType={null} onGoHome={() => {}} />);
    expect(screen.getByText(/Cargando pedido/i)).toBeInTheDocument();
  });

  it('cuando el pedido está "entregado" muestra el CTA Ver Menú', async () => {
    const onGoHome = vi.fn();
    render(
      <OrderPageView
        status="entregado"
        orderType="domicilio"
        onGoHome={onGoHome}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /No tienes Ordenes activas/i }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Ver Menú/i }));
    expect(onGoHome).toHaveBeenCalledTimes(1);
  });

  it("en estado en progreso renderiza el timeline", () => {
    render(
      <OrderPageView
        status="cocinando"
        orderType="domicilio"
        onGoHome={() => {}}
      />,
    );
    expect(screen.getByText(/En preparación/i)).toBeInTheDocument();
  });
});
