import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stubFetch } from "../helpers/api";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
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
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/assets/images/loginImg.jpg", () => ({
  default: { src: "/login-img.jpg" },
}));

import { UserProvider } from "@/context/UserContext";
import LoginPage from "@/src/app/login/page";

describe("LoginPage", () => {
  it("sin sesión renderiza el formulario de login", async () => {
    stubFetch({ "GET /api/auth/me": { user: null } });
    render(
      <UserProvider>
        <LoginPage />
      </UserProvider>,
    );
    expect(
      await screen.findByPlaceholderText(/Enter your email/i),
    ).toBeInTheDocument();
  });

  it("con sesión muestra el botón de cerrar sesión y llama logout", async () => {
    const fetchMock = stubFetch({
      "GET /api/auth/me": {
        user: {
          id: "1",
          email: "user@x.com",
          name: null,
          phone: null,
          role: "user",
        },
      },
      "POST /api/auth/logout": { ok: true },
    });

    render(
      <UserProvider>
        <LoginPage />
      </UserProvider>,
    );

    const btn = await screen.findByRole("button", { name: /Cerrar sesión/i });
    await userEvent.click(btn);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
