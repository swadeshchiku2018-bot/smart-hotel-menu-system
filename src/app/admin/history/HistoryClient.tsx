'use client';

import { useState, useEffect } from 'react';
import { getHistoryOrders } from '@/actions/orders';
import { Search, Calendar, User, Utensils } from 'lucide-react';

export default function HistoryClient() {
  const [dateStr, setDateStr] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true);
      try {
        const data = await getHistoryOrders(dateStr);
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch history orders', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (dateStr) {
      fetchOrders();
    }
  }, [dateStr]);

  const statusColors: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    'PREPARING': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'SERVED': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'COMPLETED': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Calendar className="w-5 h-5 text-slate-400" />
          <h2 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-sm flex-shrink-0">
            Select Day
          </h2>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-primary font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex items-center justify-center">
           <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-16 rounded-2xl border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center shadow-sm">
           <Utensils className="w-12 h-12 text-slate-300 mb-4" />
           <p className="text-slate-500 font-bold text-lg">No orders found for {dateStr}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col md:flex-row">
              {/* Order Info */}
              <div className="p-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 min-w-[250px] flex flex-col items-start justify-center">
                <div className="flex items-center gap-3 mb-4 w-full justify-between">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-lg font-bold">
                    {order.table.tableNumber}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className="mb-2 w-full">
                  <h3 className="font-bold text-base">Table {order.table.tableNumber}</h3>
                  <div className="text-xs text-slate-500 font-medium">
                    {new Date(order.createdAt).toLocaleTimeString()} · Order #{order.id.slice(-6).toUpperCase()}
                  </div>
                </div>
                {order.customerName && (
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mb-3 bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                     <User className="w-3 h-3" /> {order.customerName}
                  </div>
                )}
                <div className="text-sm font-semibold mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 w-full">
                  Total Amount <br/><span className="text-primary text-xl font-black tabular-nums tracking-tight">₹{order.totalAmount.toFixed(0)}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 flex-1 flex flex-col justify-center">
                <ul className="space-y-2">
                  {order.items.map((item: any) => (
                    <li key={item.id} className="flex justify-between items-center py-2 border-b border-dashed border-slate-200 dark:border-slate-700 last:border-0">
                      <span className="flex items-center gap-2">
                        <span className="font-black text-slate-700 dark:text-slate-300 w-6">{item.quantity}x</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.dish.name}</span>
                        {item.portion && item.portion !== 'Full' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] uppercase font-black tracking-wider">
                            {item.portion}
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-slate-500">₹{(item.price * item.quantity).toFixed(0)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
