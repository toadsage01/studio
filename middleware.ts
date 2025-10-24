import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = [
  '/auth/signin',
  '/favicon.ico',
  '/_next',
  '/api/auth',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  let token: any = null;
  try {
    // Be tolerant if NEXTAUTH_SECRET is not set in dev; getToken will handle defaults when possible.
    token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  } catch (_e) {
    token = null;
  }
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/signin';
    url.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(url);
  }

  // Basic RBAC: restrict /admin/* to Admin role
  if ((pathname.startsWith('/admin') || pathname.startsWith('/users')) && token.role !== 'Admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images/|api/auth).*)',
  ],
};
