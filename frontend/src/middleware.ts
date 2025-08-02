import { NextRequest, NextResponse } from "next/server";
import { validateToken, setCookieValue } from "./auth";

export async function middleware(request: NextRequest) {
  const currentUrl = request.nextUrl.pathname;
  await setCookieValue("previousUrl", currentUrl);

  const res = await validateToken();

  // TODO: put this only in production
  if (!res.ok) {
    return NextResponse.redirect(`${request.nextUrl.origin}/login`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/logs"],
};
