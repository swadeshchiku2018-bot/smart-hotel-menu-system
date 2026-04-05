import AccountsClient from './AccountsClient';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
  const users = await (prisma as any).user.findMany({
    where: { role: { in: ['ADMIN', 'WAITER'] } },
    orderBy: { role: 'asc' }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">Personnel Accounts</h1>
      <AccountsClient users={users} />
    </div>
  );
}
