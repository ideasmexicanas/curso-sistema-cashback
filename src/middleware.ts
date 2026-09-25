import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('loyalty_session')?.value;
  
  // Si no hay token y quiere entrar a zonas protegidas, lo mandamos al login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si hay token, lo dejamos pasar
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/pos/:path*',
  ],
};
