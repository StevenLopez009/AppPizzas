import { api } from "@/lib/api";

export interface Banner {
  id: string;
  image_url: string;
  created_at: string;
}

export async function getBanners(): Promise<Banner[]> {
  const { banners } = await api.get<{ banners: Banner[] }>("/api/banners");
  return banners;
}

export async function createBanner(image_url: string): Promise<Banner> {
  const { banner } = await api.post<{ banner: Banner }>("/api/banners", {
    image_url,
  });
  return banner;
}

export async function deleteBanner(id: string) {
  await api.delete(`/api/banners/${encodeURIComponent(id)}`);
}
