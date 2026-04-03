import { NextRequest, NextResponse } from 'next/server';

const isOnLogin = (url: string) => url.endsWith('/login');

export default function proxy(request: NextRequest) {
  const originalUrl =
    request.nextUrl.protocol +
    request.headers.get('host') +
    request.nextUrl.pathname;
  const cookieStore = request.cookies;
  const activeEnvCookie = cookieStore.get('activeEnv');
  if (!activeEnvCookie) {
    if (isOnLogin(request.url)) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  const accessToken = cookieStore.get(`${activeEnvCookie.value}AccessToken`);
  if (!accessToken) {
    if (isOnLogin(request.url)) {
      return NextResponse.next();
    } else {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('env', activeEnvCookie.value);
      return NextResponse.redirect(loginUrl);
    }
  }
  if (request.url.includes('session-timeout')) {
    const response = NextResponse.redirect(new URL(`/login`, originalUrl));
    response.cookies.delete(`${activeEnvCookie.value}AccessToken`);
    return response;
  }
  if (isOnLogin(request.url)) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
