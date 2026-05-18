import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/lib/auth/cookies";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filePath = path.join(process.cwd(), "public", "uploads", ...segments);

  // Prevent path traversal
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!filePath.startsWith(uploadsDir)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    await requireAdmin();
  } catch {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { path: segments } = await params;
  const filePath = path.join(process.cwd(), "public", "uploads", ...segments);
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  // Prevent path traversal
  if (!filePath.startsWith(uploadsDir)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    await fs.unlink(filePath);
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
