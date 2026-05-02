import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stubFetch } from "../helpers/api";

const { toastSuccess, toastError } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: Object.assign(vi.fn(), {
    success: toastSuccess,
    error: toastError,
  }),
  Toaster: () => null,
}));

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  toastSuccess.mockClear();
  toastError.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("DevSeedControl", () => {
  it("se renderiza en modo desarrollo", async () => {
    const DevSeedControl = (
      await import("@/components/dev/DevSeedControl")
    ).default;
    render(<DevSeedControl />);
    expect(
      screen.getByRole("button", {
        name: /Sembrar productos y pedidos/i,
      }),
    ).toBeInTheDocument();
  });

  it("al hacer click llama /api/dev/seed y dispara toast.success", async () => {
    const fetchMock = stubFetch({
      "POST /api/dev/seed": { ok: true, productsCount: 6, ordersCount: 10 },
    });
    const DevSeedControl = (
      await import("@/components/dev/DevSeedControl")
    ).default;
    render(<DevSeedControl />);

    await userEvent.click(screen.getByRole("button", { name: /Sembrar/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/dev/seed",
      expect.objectContaining({ method: "POST" }),
    );
    await vi.waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith(
        expect.stringMatching(/6 productos, 10 pedidos/i),
      );
    });
    expect(toastError).not.toHaveBeenCalled();
  });

  it("dispara toast.error si la API responde !ok", async () => {
    stubFetch({
      "POST /api/dev/seed": { __status: 500, ok: false, error: "boom" },
    });
    const DevSeedControl = (
      await import("@/components/dev/DevSeedControl")
    ).default;
    render(<DevSeedControl />);

    await userEvent.click(screen.getByRole("button", { name: /Sembrar/i }));

    await vi.waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("boom");
    });
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("oculta el panel en producción", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const DevSeedControl = (
      await import("@/components/dev/DevSeedControl")
    ).default;
    const { container } = render(<DevSeedControl />);
    expect(container).toBeEmptyDOMElement();
  });
});
