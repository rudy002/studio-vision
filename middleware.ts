import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware({
  locales: ['fr', 'en', 'he'],
  defaultLocale: 'en'
});

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Ne pas rediriger les routes admin et api
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)']
};