import { getTables } from '@/actions/tables';
import { getOrders } from '@/actions/orders';
import { getDishes } from '@/actions/dishes';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [tables, orders, dishes] = await Promise.all([
    getTables(),
    getOrders(),
    getDishes()
  ]);

  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const revenue = orders.filter(o => o.status === 'COMPLETED').reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">System Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-slate-500 dark:text-slate-400 mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold text-primary">{pendingOrders.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-slate-500 dark:text-slate-400 mb-2">Total Tables</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{tables.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-slate-500 dark:text-slate-400 mb-2">Active Dishes</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{dishes.filter(d => d.isAvailable).length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-slate-500 dark:text-slate-400 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-emerald-500">₹{revenue.toFixed(0)}</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <p className="text-slate-500 mb-4">Select an option from the sidebar to manage different aspects of the system.</p>
      </div>
    </div>
  );
}
