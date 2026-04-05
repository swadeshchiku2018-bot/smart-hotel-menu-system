import { getDishes } from '@/actions/dishes';
import { getCategories } from '@/actions/categories';
import { getHotelName } from '@/actions/settings';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CustomerMenuClient from './CustomerMenuClient';

export const dynamic = 'force-dynamic';

export default async function CustomerMenuPage({ params }: { params: { tableId: string } }) {
  // Try to find the table by ID or use a demo fallback if "demo" is in the ID for previewing
  let table = null;
  if (params.tableId.startsWith('demo-table-')) {
    table = { id: params.tableId, tableNumber: params.tableId.split('-')[2] };
  } else {
    table = await prisma.table.findUnique({ where: { id: params.tableId } });
  }

  if (!table) {
    notFound();
  }

  const [dishes, categories, hotelName] = await Promise.all([
    getDishes(),
    getCategories(),
    getHotelName()
  ]);

  const availableDishes = dishes.filter(d => d.isAvailable);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <CustomerMenuClient 
        table={table} 
        dishes={availableDishes} 
        categories={categories} 
        hotelName={hotelName}
      />
    </div>
  );
}
