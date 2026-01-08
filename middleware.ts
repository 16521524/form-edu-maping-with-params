import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const authFromHeader = req.headers.get("authorization");
  const cookieAuthRaw = req.cookies.get("APP_AUTH")?.value;
  const cookieAuthDecoded = cookieAuthRaw ? decodeURIComponent(cookieAuthRaw) : null;
  const cookieAuth =
    cookieAuthDecoded && cookieAuthDecoded.toLowerCase().startsWith("bearer")
      ? cookieAuthDecoded
      : null;
  const auth = authFromHeader || cookieAuth;

  console.log("[DEBUG-TOKEN-AUTH]", auth);

  const requestHeaders = new Headers(req.headers);
  if (auth && !requestHeaders.has("authorization")) {
    requestHeaders.set("authorization", auth);
  }

  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (auth && auth.toLowerCase().startsWith("bearer")) {
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
