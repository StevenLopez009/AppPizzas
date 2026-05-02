import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stubFetch } from "../helpers/api";

const replace = vi.fn();
const refresh = vi.fn();

beforeEach(() => {
  replace.mockClear();
  refresh.mockClear();
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace,
    refresh,
    back: vi.fn(),
    prefetch: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: { src: { src: string }; alt: string }) => (
    <img src={typeof src === "string" ? src : src?.src} alt={alt} {...rest} />
  ),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/assets/images/loginImg.jpg", () => ({
  default: { src: "/login-img.jpg" },
}));

import SignInForm from "@/components/auth/SignInForm";

describe("SignInForm", () => {
  it("muestra errores de validación si el formulario está vacío", async () => {
    render(<SignInForm setTypeSelected={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /Ingresar/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Por favor ingresa un correo válido/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/al menos 6 caracteres/i),
      ).toBeInTheDocument();
    });
  });

  it("login admin redirige a /dashboardAdmin", async () => {
    stubFetch({
      "POST /api/auth/login": {
        user: { id: "1", email: "admin@x.com", role: "admin" },
      },
    });

    render(<SignInForm setTypeSelected={vi.fn()} />);
    await userEvent.type(
      screen.getByPlaceholderText(/Enter your email/i),
      "admin@x.com",
    );
    await userEvent.type(
      screen.getByPlaceholderText(/Enter password/i),
      "secret123",
    );
    await userEvent.click(screen.getByRole("button", { name: /Ingresar/i }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/dashboardAdmin");
    });
  });

  it("login usuario normal redirige a /dashboard", async () => {
    stubFetch({
      "POST /api/auth/login": {
        user: { id: "2", email: "user@x.com", role: "user" },
      },
    });

    render(<SignInForm setTypeSelected={vi.fn()} />);
    await userEvent.type(
      screen.getByPlaceholderText(/Enter your email/i),
      "user@x.com",
    );
    await userEvent.type(
      screen.getByPlaceholderText(/Enter password/i),
      "secret123",
    );
    await userEvent.click(screen.getByRole("button", { name: /Ingresar/i }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("muestra toast de error con credenciales inválidas", async () => {
    stubFetch({
      "POST /api/auth/login": {
        __status: 401,
        error: "Credenciales inválidas",
      },
    });

    render(<SignInForm setTypeSelected={vi.fn()} />);
    await userEvent.type(
      screen.getByPlaceholderText(/Enter your email/i),
      "x@x.com",
    );
    await userEvent.type(
      screen.getByPlaceholderText(/Enter password/i),
      "wrongpass",
    );
    await userEvent.click(screen.getByRole("button", { name: /Ingresar/i }));

    await waitFor(() => {
      expect(replace).not.toHaveBeenCalled();
    });
  });
});
