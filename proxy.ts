import {NextRequest, NextResponse} from "next/server";
import {verifyToken} from "@/lib/auth";
import {JWTPayload} from "@/lib/types";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token: string | undefined = request.cookies.get('auth-token')?.value;
  const payload: JWTPayload | undefined = token ? await verifyToken(token) ?? undefined : undefined;

  if ((pathname.startsWith("/profile") || pathname.startsWith("/quiz") || pathname.startsWith("/guide") || pathname.startsWith("/game")) && !payload) {
    return NextResponse.redirect(new URL('/applicant', request.url));
  }

  if (!payload) return NextResponse.next();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role.toString());
  requestHeaders.set('x-user-name', encodeURIComponent(payload.name));
  if (payload.phone) requestHeaders.set('x-user-phone', payload.phone?.toString());
  requestHeaders.set('x-user-verified', payload.verified.toString());

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}