import { NextRequest, NextResponse } from 'next/server';

const isOnLogin = (url: string) => url.endsWith('/login');

// add function to check if the url ends in any file format like .ico, .png .json or any other file format using regex
const isSpecialPath = (url: string) => {
  const regex = /\/(middleware)\//;
  return regex.test(url);
};

export async function middleware(request: NextRequest) {
  if (isSpecialPath(request.url)) return NextResponse.next();
  const originalUrl =
    request.nextUrl.protocol +
    request.headers.get('host') +
    request.nextUrl.pathname;
  const cookieStore = request.cookies;
  const activeEnv = cookieStore.get('activeEnv')!;
  if (!activeEnv) {
    if (isOnLogin(request.url)) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  const accessToken = cookieStore.get(`${activeEnv.value}AccessToken`);
  if (!accessToken) {
    if (isOnLogin(request.url)) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  if (request.url.includes('session-timeout')) {
    const response = NextResponse.redirect(new URL(`/login`, originalUrl));
    response.cookies.delete(`${activeEnv.value}AccessToken`);
    console.log('Redirecting from session timeout');
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
