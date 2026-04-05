'use client';

import { useState, useMemo } from 'react';
import { Calendar, DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, XCircle, CheckCircle } from 'lucide-react';

export default function AnalyticsClient({ initialOrders }: { initialOrders: any[] }) {
  const [filterMode, setFilterMode] = useState<'ALL' | 'MONTH' | 'DAY'>('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // Filter orders based on the selcted tab
  const filteredOrders = useMemo(() => {
    return initialOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      if (filterMode === 'ALL') return true;
      if (filterMode === 'DAY') {
        return orderDate.toISOString().split('T')[0] === selectedDate;
      }
      if (filterMode === 'MONTH') {
        return orderDate.toISOString().slice(0, 7) === selectedMonth;
      }
      return true;
    });
  }, [initialOrders, filterMode, selectedDate, selectedMonth]);

  // Aggregate metrics
  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter(o => o.status === 'COMPLETED');
  const cancelledOrders = filteredOrders.filter(o => o.status === 'CANCELLED');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
          <button 
            onClick={() => setFilterMode('ALL')} 
            className={`px-4 py-2 rounded-md font-semibold text-sm transition ${filterMode === 'ALL' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>
            All Time
          </button>
          <button 
            onClick={() => setFilterMode('MONTH')} 
            className={`px-4 py-2 rounded-md font-semibold text-sm transition ${filterMode === 'MONTH' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>
            By Month
          </button>
          <button 
            onClick={() => setFilterMode('DAY')} 
            className={`px-4 py-2 rounded-md font-semibold text-sm transition ${filterMode === 'DAY' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}>
            Particular Day
          </button>
        </div>

        <div>
          {filterMode === 'DAY' && (
            <input 
              type="date" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)} 
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent"
            />
          )}
          {filterMode === 'MONTH' && (
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)} 
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent"
            />
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Gross Revenue</p>
              <h3 className="text-3xl font-black text-emerald-500">₹{totalRevenue.toFixed(0)}</h3>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400">Total revenue from completed orders.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Successful Orders</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white">{completedOrders.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400">Orders marked as COMPLETED.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Cancelled Orders</p>
              <h3 className="text-3xl font-black text-red-500">{cancelledOrders.length}</h3>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-lg">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400">Orders failed or deliberately cancelled.</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Transaction History
          </h3>
          <span className="text-sm text-slate-500">{filteredOrders.length} total</span>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No transactions found for the selected period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 font-semibold">Date & Time</th>
                  <th className="px-6 py-3 font-semibold">Order ID</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Items</th>
                  <th className="px-6 py-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      {new Date(order.createdAt).toLocaleDateString()} <span className="text-slate-400 text-xs ml-1">{new Date(order.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 truncate max-w-[120px]">
                      {order.id}
                    </td>
                    <td className="px-6 py-4">
                      {order.status === 'COMPLETED' && <span className="px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md text-xs font-bold">COMPLETED</span>}
                      {order.status === 'CANCELLED' && <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-md text-xs font-bold">CANCELLED</span>}
                      {!['COMPLETED', 'CANCELLED'].includes(order.status) && <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-xs font-bold">{order.status}</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {order.items?.length || 0} items
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${order.status === 'CANCELLED' ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                      ₹{order.totalAmount.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
