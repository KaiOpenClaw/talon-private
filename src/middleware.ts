import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/health',
  '/_next',
  '/favicon.ico',
];

// Check if path is public
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Check for auth token in cookie
  const authToken = request.cookies.get('talon-auth-token')?.value;
  const expectedToken = process.env.TALON_AUTH_TOKEN;
  
  // If no auth token configured, allow access (development mode)
  if (!expectedToken) {
    return NextResponse.next();
  }
  
  // Verify token
  if (!authToken || authToken !== expectedToken) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to access this resource' },
        { status: 401 }
      );
    }
    
    // For pages, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
