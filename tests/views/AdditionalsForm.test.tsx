import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stubFetch } from "../helpers/api";

vi.spyOn(window, "confirm").mockImplementation(() => true);

vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
  Toaster: () => null,
}));

import AdditionalsForm from "@/components/aditionalsForm/AdittionalsForm";

describe("AdditionalsForm", () => {
  it("renderiza adicionales existentes y permite borrar uno", async () => {
    let listAfterDelete = false;
    stubFetch({
      "GET /api/additionals": () =>
        listAfterDelete
          ? { additionals: [] }
          : {
              additionals: [
                {
                  id: "a1",
                  name: "Queso extra",
                  price: 3000,
                  category: "pizza",
                  active: true,
                },
              ],
            },
      "DELETE /api/additionals/a1": () => {
        listAfterDelete = true;
        return { ok: true };
      },
    });

    render(<AdditionalsForm />);
    expect(await screen.findByText("Queso extra")).toBeInTheDocument();

    const trashButtons = screen.getAllByRole("button");
    const deleteBtn = trashButtons.find((b) =>
      b.className.includes("bg-red-50"),
    );
    expect(deleteBtn).toBeTruthy();
    await userEvent.click(deleteBtn!);

    await waitFor(() => {
      expect(
        screen.getByText(/No hay adicionales creados/i),
      ).toBeInTheDocument();
    });
  });

  it("crea un adicional con POST /api/additionals", async () => {
    let createdName: string | null = null;
    stubFetch({
      "GET /api/additionals": () =>
        createdName
          ? {
              additionals: [
                {
                  id: "n1",
                  name: createdName,
                  price: 1000,
                  category: "pizza",
                  active: true,
                },
              ],
            }
          : { additionals: [] },
      "POST /api/additionals": (init: RequestInit | undefined) => {
        const body = JSON.parse((init?.body as string) || "{}");
        createdName = body.name;
        return {
          additional: {
            id: "n1",
            name: body.name,
            price: body.price,
            category: body.category,
            active: true,
          },
        };
      },
    });

    render(<AdditionalsForm />);
    await screen.findByText(/No hay adicionales creados/i);

    await userEvent.type(
      screen.getByPlaceholderText(/Nombre del adicional/i),
      "Tocineta",
    );
    await userEvent.type(screen.getByPlaceholderText(/Precio/i), "1000");
    await userEvent.selectOptions(screen.getByRole("combobox"), "pizza");

    await userEvent.click(
      screen.getByRole("button", { name: /Crear adicional/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Tocineta")).toBeInTheDocument();
    });
  });
});
