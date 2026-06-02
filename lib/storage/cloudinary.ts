"use client";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(file: File): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", PRESET!);

  const res = await fetch(url, { method: "POST", body: fd });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload falló: ${text}`);
  }
  const data = (await res.json()) as { secure_url: string };
  return data.secure_url;
}

async function uploadToLocalApi(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try {
      msg = (JSON.parse(text) as { error?: string }).error ?? text;
    } catch {
      // body no es JSON, usamos el texto crudo
    }
    throw new Error(`Upload falló: ${msg}`);
  }
  const data = JSON.parse(text) as { url: string };
  return data.url;
}

/**
 * Sube una imagen y devuelve su URL pública.
 *
 * Estrategia:
 * - Si `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
 *   están definidos → upload directo a Cloudinary (recomendado en producción
 *   y multi-instancia, ya que las imágenes viven fuera del contenedor).
 * - Si no → fallback a `POST /api/upload`, que guarda en `public/uploads/`.
 *   Útil en desarrollo y despliegues self-hosted con un solo nodo.
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (CLOUD && PRESET) return uploadToCloudinary(file);
  return uploadToLocalApi(file);
}
