import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'super-secret-fallback-key-replace-in-production';
const encodedKey = new TextEncoder().encode(secretKey);

const protectedRoutes = ['/dashboard', '/projects'];
const publicOnlyRoutes = ['/', '/login', '/signup'];

export default async function proxy(request) {
  const path = request.nextUrl.pathname;
  
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicOnlyRoute = publicOnlyRoutes.includes(path);
  
  const token = request.cookies.get('token')?.value;
  let session = null;
  
  if (token) {
    try {
      const { payload } = await jwtVerify(token, encodedKey);
      session = payload;
    } catch (error) {
      // Invalid token
    }
  }

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  if (isPublicOnlyRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
