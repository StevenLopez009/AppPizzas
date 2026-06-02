import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stubFetch } from "../helpers/api";

vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
  Toaster: () => null,
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: { src: { src: string }; alt: string }) => (
    <img src={typeof src === "string" ? src : src?.src} alt={alt} {...rest} />
  ),
}));

vi.mock("@/assets/images/createProduct.jpg", () => ({
  default: { src: "/createProduct.jpg" },
}));

const uploadMock = vi.fn(async () => "https://cdn/uploaded.png");
vi.mock("@/lib/storage/cloudinary", () => ({
  uploadImageToCloudinary: () => uploadMock(),
}));

import CreateProductForm from "@/components/createProductForm/CreateProductForm";

describe("CreateProductForm", () => {
  it("envía POST /api/products con prices Personal/Mediana para Pizza", async () => {
    const fetchMock = stubFetch({
      "POST /api/products": (init: RequestInit | undefined) => {
        return { product: JSON.parse((init?.body as string) || "{}") };
      },
    });

    render(<CreateProductForm />);

    await userEvent.type(
      screen.getByPlaceholderText(/Nombre del producto/i),
      "Pizza Nueva",
    );
    await userEvent.type(
      screen.getByPlaceholderText(/Descripción/i),
      "Sabor único",
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Pizza Sal");
    await userEvent.type(
      screen.getByPlaceholderText(/Precio Personal/i),
      "18000",
    );
    await userEvent.type(
      screen.getByPlaceholderText(/Precio Mediana/i),
      "32000",
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Guardar Producto/i }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/products",
        expect.objectContaining({ method: "POST" }),
      );
      const body = JSON.parse(
        (fetchMock.mock.calls.at(-1)?.[1] as RequestInit).body as string,
      );
      expect(body).toMatchObject({
        name: "Pizza Nueva",
        category: "Pizza Sal",
        prices: [
          { label: "Personal", price: 18000 },
          { label: "Mediana", price: 32000 },
        ],
      });
    });
  });

  it("para Bebidas envía un solo precio sin label", async () => {
    const fetchMock = stubFetch({
      "POST /api/products": (init: RequestInit | undefined) => ({
        product: JSON.parse((init?.body as string) || "{}"),
      }),
    });

    render(<CreateProductForm />);
    await userEvent.type(
      screen.getByPlaceholderText(/Nombre del producto/i),
      "Gaseosa",
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Bebidas");
    await userEvent.type(screen.getByPlaceholderText(/^Precio$/i), "3500");

    await userEvent.click(
      screen.getByRole("button", { name: /Guardar Producto/i }),
    );

    await waitFor(() => {
      const body = JSON.parse(
        (fetchMock.mock.calls.at(-1)?.[1] as RequestInit).body as string,
      );
      expect(body.prices).toEqual([{ label: "", price: 3500 }]);
    });
  });
});
