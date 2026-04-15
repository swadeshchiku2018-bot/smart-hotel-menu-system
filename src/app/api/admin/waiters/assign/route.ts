import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { waiterId, tableIds } = await req.json();

    if (!waiterId || !Array.isArray(tableIds)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // A Waiter can have many tables. In Prisma, when we update a User, we can 'set' their tables.
    // This connects the specific tables to the user and disconnects any tables that are not in the list.
    const updatedUser = await (prisma as any).user.update({
      where: { id: waiterId },
      data: {
        tables: {
          set: tableIds.map((id: string) => ({ id }))
        }
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Failed to assign tables:', error);
    return NextResponse.json({ error: 'Failed to assign tables' }, { status: 500 });
  }
}
