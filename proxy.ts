import {NextRequest, NextResponse} from "next/server";
import {verifyToken} from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get('auth-token')?.value;
  const commissionToken = request.cookies.get('commission-token')?.value;

  const applicant = authToken ? await verifyToken(authToken) ?? undefined : undefined;
  const commission = commissionToken ? await verifyToken(commissionToken) !== null : false;

  function deleteAndRedirect(cookie: string) {
    const res = NextResponse.redirect(new URL('/', request.url));
    res.cookies.delete(cookie);
    return res;
  }

  if (authToken && !applicant) return deleteAndRedirect('auth-token');
  if (commissionToken && !commission) return deleteAndRedirect('commission-token');

  const isApplicantRoute =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/quiz") ||
    pathname.startsWith("/game");

  if (isApplicantRoute && !applicant)
    return NextResponse.redirect(new URL('/applicant', request.url));

  if (pathname.startsWith("/commission/dashboard") && !commission)
    return NextResponse.redirect(new URL('/commission', request.url));

  if (pathname.startsWith("/api/commission/") &&
     !pathname.startsWith("/api/commission/login") && !commission)
    return NextResponse.json({error: "Unauthorized"}, {status: 401});

  if (pathname.startsWith("/api/cart") ||
      pathname.startsWith("/api/orders"))
    return NextResponse.json({error: "Магазин не работает"}, {status: 401});

  if ((pathname.startsWith("/api/cart") ||
       pathname.startsWith("/api/orders")) && (!applicant || !applicant.hasPhone))
    return NextResponse.json({error: "Unauthorized"}, {status: 401});

  const requestHeaders = new Headers(request.headers);

  if (applicant) {
    requestHeaders.set('x-user-id', applicant.userId);
    requestHeaders.set('x-user-name', encodeURIComponent(applicant.name));
    requestHeaders.set('x-user-has-phone', (applicant.hasPhone ?? false).toString());
  }

  if (commission) requestHeaders.set('x-commission', 'true');

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}
