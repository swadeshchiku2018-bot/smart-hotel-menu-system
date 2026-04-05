import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, password } = await req.json();
  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = await (prisma as any).user.create({
    data: {
      name,
      hashedPassword,
      role: 'WAITER'
    }
  });

  return NextResponse.json({ success: true, user });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  await (prisma as any).user.delete({
    where: { id }
  });

  return NextResponse.json({ success: true });
}
