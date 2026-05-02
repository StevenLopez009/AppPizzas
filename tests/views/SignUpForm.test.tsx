import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stubFetch } from "../helpers/api";

const push = vi.fn();
const refresh = vi.fn();

beforeEach(() => {
  push.mockClear();
  refresh.mockClear();
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace: vi.fn(),
    refresh,
    back: vi.fn(),
    prefetch: vi.fn(),
    forward: vi.fn(),
  }),
}));

import SignUpForm from "@/components/auth/SignUpForm";

describe("SignUpForm", () => {
  it("crea cuenta y registra cliente, luego navega a /dashboard", async () => {
    const fetchMock = stubFetch({
      "POST /api/auth/signup": {
        __status: 201,
        user: { id: "1", email: "n@x.com", role: "user" },
      },
      "POST /api/clients": { id: "c1" },
    });

    render(<SignUpForm setTypeSelected={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText(/Juan Pérez/i), "Juan Pérez");
    await userEvent.type(
      screen.getByPlaceholderText(/correo@email\.com/i),
      "n@x.com",
    );
    await userEvent.type(screen.getByPlaceholderText(/3001234567/i), "3001234567");
    await userEvent.type(screen.getByPlaceholderText(/••••••/), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /Crear cuenta/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/auth/signup",
        expect.objectContaining({ method: "POST" }),
      );
      expect(push).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("muestra errores de validación si los campos no cumplen", async () => {
    render(<SignUpForm setTypeSelected={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /Crear cuenta/i }));
    expect(push).not.toHaveBeenCalled();
  });
});
