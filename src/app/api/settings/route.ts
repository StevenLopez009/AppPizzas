import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/cookies";
import { getSettings, setSettings } from "@/lib/repos/appSettings";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      themePrimary?: string;
      businessName?: string;
    };
    const updated = await setSettings(body);
    return NextResponse.json(updated);
  } catch (e) {
    const err = e as { status?: number; message?: string };
    if (err.status === 400) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[PATCH /api/settings]", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
