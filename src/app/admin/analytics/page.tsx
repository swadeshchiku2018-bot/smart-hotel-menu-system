import prisma from '@/lib/prisma';
import AnalyticsClient from './AnalyticsClient';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const orders = await prisma.order.findMany({
    include: {
      items: true
    },
    orderBy: { createdAt: 'desc' } // Fetch all orders to process on client for flexibility
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">Transactions Analytics</h1>
      <AnalyticsClient initialOrders={orders} />
    </div>
  );
}
