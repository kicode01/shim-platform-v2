import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';
  const pathname = url.pathname;

  // Skip static assets, API routes, and Auth pages so they work globally
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/validate') // Keep validate public
  ) {
    return NextResponse.next();
  }

  // Organizer Workspace (shim-studio)
  if (hostname.includes('shim-studio')) {
    // Map root and subpaths to /dashboard seamlessly
    if (!pathname.startsWith('/dashboard')) {
      url.pathname = `/dashboard${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Participant Wallet (shim-wallet)
  if (hostname.includes('shim-wallet')) {
    // Map root and subpaths to /portal seamlessly
    if (!pathname.startsWith('/portal')) {
      url.pathname = `/portal${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}
