import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.headers.get("authorization"); // "Bearer xxx" hoặc "token xxx:yyy"
  const res = NextResponse.next();

  // Nếu request (nhất là /mobile-table) có Authorization => lưu vào cookie
  if (auth) {
    res.cookies.set("APP_AUTH", encodeURIComponent(auth), {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // local http. Production HTTPS thì để true
      path: "/",
    });
  }

  return res;
}

// Chỉ cần áp dụng cho page và api trong app này
export const config = {
  matcher: ["/mobile-table/:path*", "/api/:path*"],
};
