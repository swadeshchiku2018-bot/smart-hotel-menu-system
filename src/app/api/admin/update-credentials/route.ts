import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newUsername, newPassword } = await req.json();

    const user = await (prisma as any).user.findUnique({ where: { id: (session.user as any).id as string } });
    if (!user || !(await bcrypt.compare(currentPassword, user.hashedPassword))) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 403 });
    }

    await (prisma as any).user.update({
      where: { id: user.id },
      data: {
        name: newUsername,
        hashedPassword: bcrypt.hashSync(newPassword, 10)
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
