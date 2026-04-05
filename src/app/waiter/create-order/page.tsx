import WaiterCreateOrderClient from './WaiterCreateOrderClient';
import { getDishes } from '@/actions/dishes';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function WaiterCreateOrderPage({ searchParams }: { searchParams: { tableId?: string, mobile?: string } }) {
  const [dishes, tables] = await Promise.all([
    getDishes(),
    (prisma as any).table.findMany({ orderBy: { tableNumber: 'asc' } })
  ]);

  const availableDishes = dishes.filter(d => d.isAvailable);

  return <WaiterCreateOrderClient dishes={availableDishes} tables={tables} defaultTable={searchParams.tableId} defaultMobile={searchParams.mobile} />;
}
