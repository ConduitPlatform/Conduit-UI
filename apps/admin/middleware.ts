import { NextRequest, NextResponse } from 'next/server';

const isOnLogin = (url: string) => url.endsWith('/login');

// add function to check if the url ends in any file format like .ico, .png .json or any other file format using regex
const isSpecialPath = (url: string) => {
  const regex = /\/(middleware)\//;
  return regex.test(url);
};

export async function middleware(request: NextRequest) {
  if (isSpecialPath(request.url)) return NextResponse.next();
  const cookieStore = request.cookies;
  const accessToken = cookieStore.get('accessToken');
  if (!accessToken) {
    if (isOnLogin(request.url)) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  const res = await fetch(`${process.env.API_BASE_URL}/admins/me`, {
    method: 'GET',
    // @ts-ignore
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken!.value}`,
      masterkey: process.env.MASTER_KEY,
    },
  }).catch(() => null);
  if (!res || res.status !== 200) {
    if (request.method !== 'GET' && !isOnLogin(request.url)) {
      return NextResponse.redirect(new URL('/login', request.url));
    } else if (isOnLogin(request.url)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  } else {
    if (isOnLogin(request.url)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
