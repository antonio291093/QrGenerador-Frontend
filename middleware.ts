import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Rutas privadas
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // (Opcional) Validar el JWT aquí si quieres mayor seguridad:
    // try {
    //   jwt.verify(token, process.env.JWT_SECRET!);
    // } catch {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }
  }

  // Evita que usuarios autenticados accedan a /login
  if (request.nextUrl.pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirección desde la raíz
  if (request.nextUrl.pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (request.nextUrl.pathname === '/' && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/login', '/'], // Puedes agregar más rutas privadas aquí
};
