import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/lib/auth/cookies";
import { uuid } from "@/lib/uuid";

const EXT_TO_TYPE: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MAX_BYTES = 5 * 1024 * 1024;

function resolveType(file: File): string {
  if (file.type && ALLOWED_TYPES.has(file.type)) return file.type;
  const ext = path.extname(file.name).toLowerCase();
  return EXT_TO_TYPE[ext] ?? file.type ?? "";
}

function extFromType(type: string): string {
  switch (type) {
    case "image/png":
      return "png";
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/avif":
      return "avif";
    default:
      return "jpg";
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo inválido (esperado multipart/form-data)" },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Falta el campo 'file'" },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Archivo vacío" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Archivo demasiado grande (máx ${MAX_BYTES / 1024 / 1024}MB)` },
      { status: 413 },
    );
  }

  const resolvedType = resolveType(file);
  if (!ALLOWED_TYPES.has(resolvedType)) {
    return NextResponse.json(
      {
        error: `Tipo de imagen no soportado: ${file.type || path.extname(file.name) || "desconocido"}. Usa JPG, PNG, WEBP, GIF o AVIF.`,
      },
      { status: 400 },
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });

  const filename = `${uuid()}.${extFromType(resolvedType)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
