import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, employees });
  } catch {
    return NextResponse.json({ success: false, error: 'Error fetching employees' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ success: false, error: 'Nombre es requerido' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const newEmployee = await prisma.employee.create({
      data: { name, tenantId: tenant.id }
    });

    return NextResponse.json({ success: true, employee: newEmployee }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Error creating employee' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Error deleting employee' }, { status: 500 });
  }
}
