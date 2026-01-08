import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const res = NextResponse.next();

  if (auth) {
    res.cookies.set("APP_AUTH", encodeURIComponent(auth), {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
  }

  return res;
}

export const config = {
  matcher: ["/mobile-table/:path*", "/api/:path*"],
};
