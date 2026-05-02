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
  default: ({ src, alt, ...rest }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...rest} />
  ),
}));

const uploadMock = vi.fn(async (_file: File) => "https://cdn/uploaded.png");
vi.mock("@/lib/storage/cloudinary", () => ({
  uploadImageToCloudinary: (file: File) => uploadMock(file),
}));

import AdminBanner from "@/src/features/admin/components/AdminBanner";

describe("AdminBanner", () => {
  it("lista banners y permite borrar uno", async () => {
    let banners = [
      { id: "b1", image_url: "https://cdn/b1.png", created_at: "2026-01-01" },
      { id: "b2", image_url: "https://cdn/b2.png", created_at: "2026-01-02" },
    ];

    stubFetch({
      "GET /api/banners": () => ({ banners }),
      "DELETE /api/banners/b1": () => {
        banners = banners.filter((b) => b.id !== "b1");
        return { ok: true };
      },
    });

    render(<AdminBanner />);

    await waitFor(() => {
      expect(screen.getAllByAltText("banner")).toHaveLength(2);
    });

    const deleteButtons = screen.getAllByRole("button", { name: /Eliminar/i });
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByAltText("banner")).toHaveLength(1);
    });
  });

  it("sube imagen a Cloudinary y crea banner por API", async () => {
    let banners: Array<{ id: string; image_url: string; created_at: string }> = [];
    const fetchMock = stubFetch({
      "GET /api/banners": () => ({ banners }),
      "POST /api/banners": (init: RequestInit | undefined) => {
        const body = JSON.parse((init?.body as string) || "{}");
        banners = [
          { id: "new", image_url: body.image_url, created_at: "now" },
        ];
        return { banner: banners[0], __status: 201 };
      },
    });

    render(<AdminBanner />);
    await waitFor(() => expect(screen.queryByAltText("banner")).toBeNull());

    const file = new File(["x"], "promo.png", { type: "image/png" });
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await userEvent.upload(input, file);

    await userEvent.click(screen.getByRole("button", { name: /Subir banner/i }));

    await waitFor(() => {
      expect(uploadMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/banners",
        expect.objectContaining({ method: "POST" }),
      );
      expect(screen.getByAltText("banner")).toBeInTheDocument();
    });
  });
});
