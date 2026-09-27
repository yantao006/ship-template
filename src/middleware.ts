import { NextResponse, type NextRequest } from 'next/server';
import { isSiteShellPath, localeFromPath, requestLocaleHeader, requestSiteShellHeader } from '@/lib/routes';

export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(requestLocaleHeader, localeFromPath(request.nextUrl.pathname));
  headers.set(requestSiteShellHeader, isSiteShellPath(request.nextUrl.pathname) ? '1' : '0');
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ['/((?!api/|_next/|favicon.ico|robots.txt|sitemap.xml).*)'] };
