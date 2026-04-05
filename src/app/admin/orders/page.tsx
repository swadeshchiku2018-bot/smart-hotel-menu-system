import { getOrders } from '@/actions/orders';
import OrdersClient from './OrdersClient';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const orders = await getOrders();
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Live Orders</h1>
        <p className="text-slate-500 mt-2">Manage incoming customer orders and update their status.</p>
      </div>
      
      <OrdersClient initialOrders={orders} />
    </div>
  );
}
