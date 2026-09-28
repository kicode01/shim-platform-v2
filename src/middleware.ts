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
    pathname.startsWith('/validate') ||
    pathname.startsWith('/attend') ||
    pathname.startsWith('/kiosk') ||
    pathname.startsWith('/scanner')
  ) {
    return NextResponse.next();
  }

  const isStudio = hostname.includes('shim-studio');
  const isWallet = hostname.includes('shim-wallet');

  // Organizer Workspace (shim-studio)
  if (isStudio) {
    // Block access to portal from studio domain
    if (pathname.startsWith('/portal')) {
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }
    
    // Map root and subpaths to /dashboard seamlessly
    if (!pathname.startsWith('/dashboard')) {
      url.pathname = `/dashboard${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Participant Wallet (shim-wallet)
  if (isWallet) {
    // Block access to dashboard from wallet domain
    if (pathname.startsWith('/dashboard')) {
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }

    // Map root and subpaths to /portal seamlessly
    if (!pathname.startsWith('/portal')) {
      url.pathname = `/portal${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Main Domain (HQ)
  if (!isStudio && !isWallet) {
    // Block access to dashboard and portal from main domain
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/portal')) {
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}
