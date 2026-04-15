import WaiterDashboardClient from './WaiterDashboardClient';
import { getOrders } from '@/actions/orders';
import { getSettings } from '@/actions/settings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function WaiterDashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const isWaiter = user?.role === 'WAITER';

  const [allOrders, settings, dbUser] = await Promise.all([
    getOrders(),
    getSettings(),
    isWaiter && user?.id ? (prisma as any).user.findUnique({
      where: { id: user.id },
      include: { tables: true }
    }) : null
  ]);

  let filteredOrders = allOrders;

  if (isWaiter && dbUser) {
    const assignedTableIds = dbUser.tables?.map((t: any) => t.id) || [];
    if (assignedTableIds.length === 0) {
      filteredOrders = [];
    } else {
      filteredOrders = allOrders.filter((o: any) => assignedTableIds.includes(o.tableId));
    }
  }

  return <WaiterDashboardClient orders={filteredOrders} settings={settings} />;
}
