import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, setCookieValue } from "./auth";

export async function middleware(request: NextRequest) {
  const currentUrl = request.nextUrl.pathname;
  await setCookieValue("previousUrl", currentUrl);

  const user = await getCurrentUser();
  console.log("user:", user);

  if (process.env.NODE_ENV !== "production" && !user) {
    return NextResponse.redirect(`${request.nextUrl.origin}/login`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/logs"],
};
