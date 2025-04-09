import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/logic/EnvManager';

const isOnLogin = (url: string) => url.endsWith('/login');

// add function to check if the url ends in any file format like .ico, .png .json or any other file format using regex
const isSpecialPath = (url: string) => {
  const regex = /\/(middleware)\//;
  return regex.test(url);
};

export async function middleware(request: NextRequest) {
  if (isSpecialPath(request.url)) return NextResponse.next();
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
  const envDetails = await getEnv(activeEnv.value);
  const res = await fetch(`${envDetails.baseUrl}admins/me`, {
    method: 'GET',
    // @ts-ignore
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken.value}`,
      masterkey: envDetails.masterKey,
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
