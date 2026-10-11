import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-session';

const publicAdminEndpoints = new Set([
  '/admin/login',
  '/api/admin/login',
  '/api/admin/logout',
]);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (publicAdminEndpoints.has(pathname)) return NextResponse.next();

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);
  if (session) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'private, no-store, max-age=0');
    return response;
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'UNAUTHENTICATED', message: 'Administrator sign-in is required.' },
      { status: 401, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  }

  const loginUrl = new URL('/admin/login', request.url);
  const requestedPath = pathname + request.nextUrl.search;
  if (requestedPath.startsWith('/admin/') && !requestedPath.startsWith('//')) {
    loginUrl.searchParams.set('next', requestedPath);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
