import AccountsClient from './AccountsClient';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTables } from '@/actions/tables';

export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
  const [users, tables] = await Promise.all([
    (prisma as any).user.findMany({
      where: { role: { in: ['ADMIN', 'WAITER'] } },
      orderBy: { role: 'asc' },
      include: { tables: true }
    }),
    getTables()
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">Personnel Accounts</h1>
      <AccountsClient users={users} tables={tables} />
    </div>
  );
}
