'use client';

import { updateOrderStatus } from '@/actions/orders';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter();

  // Auto-refresh orders every 10 seconds for real-time sync
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  const statusColors: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    'PREPARING': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'SERVED': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'COMPLETED': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
  };

  return (
    <div className="space-y-6">
      {initialOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-slate-500 text-lg">No orders found.</p>
        </div>
      ) : (
        initialOrders.map(order => (
          <div key={order.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col md:flex-row">
            
            {/* Order Info */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 min-w-[250px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-bold">
                  {order.table.tableNumber}
                </div>
                <div>
                  <h3 className="font-bold text-lg">Table {order.table.tableNumber}</h3>
                  <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <div className="text-sm font-semibold">
                Total: <span className="text-emerald-500 text-lg">₹{order.totalAmount.toFixed(0)}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6 flex-1">
              <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Order Items</h4>
              <ul className="space-y-3 mb-6">
                {order.items.map((item: any) => (
                  <li key={item.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold">{item.quantity}x</span>
                      <span>{item.dish.name}</span>
                      {item.portion && item.portion !== 'Full' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                          {item.portion}
                        </span>
                      )}
                    </span>
                    <span className="font-medium text-slate-600 dark:text-slate-400">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </li>
                ))}
              </ul>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                {order.status === 'PENDING' && (
                  <button onClick={() => updateOrderStatus(order.id, 'PREPARING')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition">
                    Start Preparing
                  </button>
                )}
                {order.status === 'PREPARING' && (
                  <button onClick={() => updateOrderStatus(order.id, 'SERVED')} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm font-medium transition">
                    Mark Served
                  </button>
                )}
                {order.status === 'SERVED' && (
                  <button onClick={() => updateOrderStatus(order.id, 'COMPLETED')} className="px-4 py-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-sm font-medium transition">
                    Complete Order
                  </button>
                )}
                {['PENDING'].includes(order.status) && (
                  <button onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 text-sm font-medium transition">
                    Cancel
                  </button>
                )}
              </div>
            </div>
            
          </div>
        ))
      )}
    </div>
  );
}
