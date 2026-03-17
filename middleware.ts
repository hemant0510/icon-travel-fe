import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("if_session")?.value;
  const requestHeaders = new Headers(request.headers);

  if (token) {
    const user = await verifyToken(token);
    if (user) {
      requestHeaders.set("x-user-id", user.id);
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)",
  ],
};
