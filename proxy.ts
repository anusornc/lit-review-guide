import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const queryLocale = request.nextUrl.searchParams.get("lang");

  if (queryLocale !== "th" && queryLocale !== "en") {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-litwise-language", queryLocale);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set("litwise-language", queryLocale, { path: "/", sameSite: "lax", maxAge: 31_536_000 });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
