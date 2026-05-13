import {NextRequest, NextResponse} from "next/server";
import {verifyToken} from "@/lib/auth";

const INTERNAL_SECRET = process.env.JWT_SECRET || 'dev-secret-key-for-local-development-only';
const INTERNAL_BASE_URL = process.env.INTERNAL_BASE_URL || 'http://127.0.0.1:3000';

function siteBaseUrl(): string {
  return (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/api/auth/user-exists') {
    return NextResponse.next();
  }

  const authToken = request.cookies.get('auth-token')?.value;
  const commissionToken = request.cookies.get('commission-token')?.value;

  const applicant = authToken ? await verifyToken(authToken) ?? undefined : undefined;
  const commission = commissionToken ? await verifyToken(commissionToken) !== null : false;

  function deleteAndRedirect(cookie: string) {
    const res = NextResponse.redirect(new URL('/', siteBaseUrl()));
    res.cookies.delete(cookie);
    return res;
  }

  if (authToken && !applicant) return deleteAndRedirect('auth-token');
  if (commissionToken && !commission) return deleteAndRedirect('commission-token');

  const isApplicantRoute =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/game");

  if (isApplicantRoute && applicant) {
    try {
      const existsRes = await fetch(
        new URL(`/api/auth/user-exists?id=${applicant.userId}`, INTERNAL_BASE_URL),
        {headers: {"x-internal": INTERNAL_SECRET}},
      );
      if (existsRes.ok) {
        const {exists} = await existsRes.json() as {exists: boolean};
        if (!exists) return deleteAndRedirect('auth-token');
      }
    } catch (err) {
      console.error("[proxy] user-exists check failed:", err);
    }
  }

  if (isApplicantRoute && !applicant)
    return NextResponse.redirect(new URL('/applicant', siteBaseUrl()));

  if (pathname.startsWith("/commission/dashboard") && !commission)
    return NextResponse.redirect(new URL('/commission', siteBaseUrl()));

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
