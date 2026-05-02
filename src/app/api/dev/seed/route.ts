import { NextResponse } from "next/server";
import { insertDevSeed } from "@/lib/dev/seedDevData";

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { ok: false, error: "Solo disponible en modo desarrollo." },
      { status: 403 },
    );
  }

  try {
    const result = await insertDevSeed();
    return NextResponse.json({ ok: true, ...result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    console.error("[dev/seed]", e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
