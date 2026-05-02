import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";

const { toastError, toastSuccess } = vi.hoisted(() => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: Object.assign(vi.fn(), {
    success: toastSuccess,
    error: toastError,
  }),
  Toaster: () => null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    forward: vi.fn(),
  }),
}));

const createOrderMock = vi.fn();
vi.mock("@/src/features/checkout/services/createOrder", () => ({
  createOrder: (...args: unknown[]) => createOrderMock(...args),
}));

const createOrderItemsMock = vi.fn();
vi.mock("@/src/features/checkout/services/createOrderItems", () => ({
  createOrderItems: (...args: unknown[]) => createOrderItemsMock(...args),
}));

vi.mock("@/src/features/checkout/services/sendWhatsAppOrder", () => ({
  sendWhatsAppOrder: vi.fn(),
}));

import { CartProvider, useCart } from "@/context/CartContext";
import { useCheckout } from "@/src/features/checkout/hooks/useCheckout";

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

beforeEach(() => {
  toastError.mockClear();
  toastSuccess.mockClear();
  createOrderMock.mockReset();
  createOrderItemsMock.mockReset();
});

describe("useCheckout", () => {
  it("toast.error si el carrito está vacío", async () => {
    const { result } = renderHook(() => useCheckout(), { wrapper });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(toastError).toHaveBeenCalledWith("Tu carrito está vacío");
    expect(createOrderMock).not.toHaveBeenCalled();
  });

  it("toast.error si no hay tipo de pedido", async () => {
    const { result } = renderHook(
      () => {
        const cart = useCart();
        const checkout = useCheckout();
        return { cart, checkout };
      },
      { wrapper },
    );

    act(() => {
      result.current.cart.addToCart({
        id: "p1",
        product_id: "p1",
        name: "Pizza",
        price: 30000,
        size: "Mediana",
        image: "x",
        quantity: 1,
      });
    });

    await act(async () => {
      await result.current.checkout.handleSubmit();
    });

    expect(toastError).toHaveBeenCalledWith("Selecciona el tipo de pedido");
    expect(createOrderMock).not.toHaveBeenCalled();
  });

  it("toast.success al crear la orden correctamente", async () => {
    createOrderMock.mockResolvedValue({ id: "ord-1" });
    createOrderItemsMock.mockResolvedValue(undefined);

    const { result } = renderHook(
      () => {
        const cart = useCart();
        const checkout = useCheckout();
        return { cart, checkout };
      },
      { wrapper },
    );

    act(() => {
      result.current.cart.addToCart({
        id: "p1",
        product_id: "p1",
        name: "Pizza",
        price: 30000,
        size: "Mediana",
        image: "x",
        quantity: 1,
      });
      result.current.cart.setOrderType("recoger");
    });

    act(() => {
      result.current.checkout.handleChange({
        target: { name: "nombre", value: "Tso" },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.checkout.handleChange({
        target: { name: "telefono", value: "3001112233" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.checkout.handleSubmit();
    });

    expect(createOrderMock).toHaveBeenCalledTimes(1);
    expect(createOrderItemsMock).toHaveBeenCalledWith("ord-1", expect.any(Array));
    expect(toastSuccess).toHaveBeenCalledWith("Pedido enviado");
  });

  it("toast.error si createOrder lanza", async () => {
    createOrderMock.mockRejectedValue(new Error("db fail"));

    const { result } = renderHook(
      () => {
        const cart = useCart();
        const checkout = useCheckout();
        return { cart, checkout };
      },
      { wrapper },
    );

    act(() => {
      result.current.cart.addToCart({
        id: "p1",
        product_id: "p1",
        name: "Pizza",
        price: 30000,
        size: "Mediana",
        image: "x",
        quantity: 1,
      });
      result.current.cart.setOrderType("recoger");
    });

    act(() => {
      result.current.checkout.handleChange({
        target: { name: "nombre", value: "Tso" },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.checkout.handleChange({
        target: { name: "telefono", value: "3001112233" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.checkout.handleSubmit();
    });

    expect(toastError).toHaveBeenCalledWith("Error creando la orden");
  });
});
