import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "@/lib/auth/session";

const SESSION_COOKIE = "session";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  const path = request.nextUrl.pathname;
  const isAdminPath = path.startsWith("/dashboardAdmin");
  const isClientDashboard = path.startsWith("/dashboard") && !isAdminPath;

  if (isAdminPath) {
    if (!session || session.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (isClientDashboard && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
