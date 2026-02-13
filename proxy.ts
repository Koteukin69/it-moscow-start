import {NextRequest, NextResponse} from "next/server";
import {verifyToken} from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get('auth-token')?.value;
  const commissionToken = request.cookies.get('commission-token')?.value;

  const applicant = authToken ? await verifyToken(authToken) ?? undefined : undefined;
  const commission = commissionToken ? await verifyToken(commissionToken) !== null : false;

  const isApplicantRoute = pathname.startsWith("/profile") || pathname.startsWith("/quiz") || pathname.startsWith("/guide") || pathname.startsWith("/game") || pathname.startsWith("/shop");

  if (isApplicantRoute && !applicant) {
    return NextResponse.redirect(new URL('/applicant', request.url));
  }

  if (pathname.startsWith("/commission/dashboard") && !commission) {
    return NextResponse.redirect(new URL('/commission', request.url));
  }

  if (pathname.startsWith("/api/commission/") && !pathname.startsWith("/api/commission/login") && !commission) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  if (pathname.startsWith("/api/shop") && !applicant) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  const requestHeaders = new Headers(request.headers);

  if (applicant) {
    requestHeaders.set('x-user-id', applicant.userId);
    requestHeaders.set('x-user-name', encodeURIComponent(applicant.name));
    if (applicant.phone) requestHeaders.set('x-user-phone', applicant.phone);
    requestHeaders.set('x-user-verified', applicant.verified.toString());
  }

  if (commission) {
    requestHeaders.set('x-commission', 'true');
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}
