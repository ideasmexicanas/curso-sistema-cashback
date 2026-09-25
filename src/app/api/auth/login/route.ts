import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Por favor, llena todos los campos' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { email }
    });

    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
    }

    // In a real app, we should use bcrypt to hash and compare passwords.
    // For this MVP, we use plain text matching.
    if (tenant.password !== password) {
      return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('loyalty_session', tenant.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return NextResponse.json({ success: true, message: 'Autenticado' });
  } catch (error) {
    console.error('Error in login:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
