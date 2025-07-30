import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const currentUrl = request.nextUrl.pathname;
  const cookieStore = await cookies();
  cookieStore.set("previousUrl", currentUrl);

  const user = await getCurrentUser();

  if (process.env.NODE_ENV !== "production" && !user) {
    return NextResponse.redirect(`${request.nextUrl.origin}/login`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/logs"],
};
