import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { stubFetch } from "../helpers/api";

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...rest} />
  ),
}));

vi.mock("swiper/css", () => ({}));

vi.mock("swiper/react", () => ({
  Swiper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="swiper">{children}</div>
  ),
  SwiperSlide: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="slide">{children}</div>
  ),
}));

vi.mock("swiper/modules", () => ({ Autoplay: {} }));

import BannerCarousel from "@/src/features/menu/components/BannerCarousel";

describe("BannerCarousel", () => {
  it("renderiza un slide por banner", async () => {
    stubFetch({
      "GET /api/banners": {
        banners: [
          { id: "b1", image_url: "https://cdn/b1.png", created_at: "2026" },
          { id: "b2", image_url: "https://cdn/b2.png", created_at: "2026" },
        ],
      },
    });

    render(<BannerCarousel />);

    await waitFor(() => {
      expect(screen.getAllByTestId("slide")).toHaveLength(2);
    });
  });

  it("si la API falla no rompe (lista vacía)", async () => {
    stubFetch({
      "GET /api/banners": { __status: 500, error: "boom" },
    });
    render(<BannerCarousel />);
    expect(screen.getByTestId("swiper")).toBeInTheDocument();
  });
});
