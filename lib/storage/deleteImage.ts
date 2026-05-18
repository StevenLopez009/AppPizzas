import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Borra un archivo de imagen local si la URL apunta a /uploads/ o /api/uploads/.
 * Las URLs de Cloudinary u otros servicios externos son ignoradas.
 */
export async function deleteLocalImage(
  imageUrl: string | null | undefined,
): Promise<void> {
  if (!imageUrl) return;

  // Solo imágenes locales (no Cloudinary ni otros dominios)
  if (
    !imageUrl.startsWith("/uploads/") &&
    !imageUrl.startsWith("/api/uploads/")
  ) {
    return;
  }

  const filename = path.basename(imageUrl);
  const filePath = path.join(process.cwd(), "public", "uploads", filename);

  try {
    await fs.unlink(filePath);
  } catch {
    // Ignorar si el archivo no existe (puede ya haber sido borrado)
  }
}
