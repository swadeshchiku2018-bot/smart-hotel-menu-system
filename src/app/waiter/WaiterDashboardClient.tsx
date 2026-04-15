'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '@/actions/orders';
import { User, Phone, CheckCircle, Receipt, Utensils, AlertCircle, PlusCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

export default function WaiterDashboardClient({ orders, settings }: { orders: any[], settings: any }) {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'BILLS'>('ORDERS');
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [localOrders, setLocalOrders] = useState(orders);
  const router = useRouter();
  const prevOrderIds = useRef<Set<string>>(new Set(orders.map(o => o.id)));

  // Request Notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Sync server prop state natively when polling happens and trigger notifications
  useEffect(() => {
    setLocalOrders(orders);

    const currentIds = new Set(orders.map(o => o.id));
    const newOrders = orders.filter(o => !prevOrderIds.current.has(o.id));

    if (newOrders.length > 0 && typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        newOrders.forEach(no => {
          if (no.status === 'PENDING') {
            new Notification(`New Order - Table ${no.table?.tableNumber}`, {
              body: `${no.customerName || 'Walk-in'} just placed a new order.`,
            });
          }
        });
      }
    }
    prevOrderIds.current = currentIds;
  }, [orders]);

  // Auto-refresh orders every 10 seconds for real-time sync
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  // Filter Orders for Floor
  const activeOrders = localOrders.filter(o => ['PENDING', 'PREPARING', 'SERVED'].includes(o.status));
  
  // Group Unpaid for Billing
  const unpaidOrders = localOrders.filter(o => o.paymentStatus !== 'PAID' && o.customerName);
  const billingGroups: Record<string, typeof localOrders> = {};
  unpaidOrders.forEach(o => {
    const key = `${o.customerName}`;
    if (!billingGroups[key]) billingGroups[key] = [];
    billingGroups[key].push(o);
  });

  const handleStatusChange = async (id: string, status: string) => {
    // Instant UI update (optimistic)
    setLocalOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    // Server execution
    await updateOrderStatus(id, status);
    router.refresh();
  };

  const handleMarkPaid = async (orderIds: string[]) => {
    for (const id of orderIds) {
      await fetch('/api/billing/mark-paid', { method: 'POST', body: JSON.stringify({ orderId: id }) });
    }
    window.location.reload();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl max-w-sm mx-auto shadow-sm">
        <button 
          onClick={() => setActiveTab('ORDERS')}
          className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${activeTab === 'ORDERS' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-500'}`}
        >
          Live Orders
        </button>
        <button 
          onClick={() => setActiveTab('BILLS')}
          className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${activeTab === 'BILLS' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-500'}`}
        >
          Process Bills
        </button>
      </div>

      {activeTab === 'ORDERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOrders.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
               <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
               <p className="font-medium text-lg">No active orders right now.</p>
            </div>
          ) : activeOrders.map(order => (
            <div key={order.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${order.status === 'PENDING' ? 'bg-amber-500' : order.status === 'PREPARING' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-3xl font-black tabular-nums">T-{order.table.tableNumber}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3" /> {order.customerName || 'Walk-in'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                    order.status === 'PREPARING' ? 'bg-blue-100 text-blue-700' : 
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {order.status}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <Link href={`/waiter/create-order?tableId=${order.tableId}&mobile=${order.customerName || ''}`} className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/20 transition">
                    <PlusCircle className="w-3 h-3"/> Add Items
                  </Link>
                </div>
              </div>

              <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 mb-4 border border-slate-100 dark:border-slate-800">
                <ul className="space-y-2 text-sm font-medium">
                  {order.items.map((item: any) => (
                    <li key={item.id} className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                      <span><span className="text-primary font-bold">{item.quantity}x</span> {item.dish.name} {item.portion !== 'Full' && <span className="text-xs text-slate-500">({item.portion})</span>}</span>
                    </li>
                  ))}
                </ul>
                {order.chefInstruction && (
                  <div className="mt-3 pt-3 border-t border-red-100 dark:border-red-900/50">
                    <p className="text-[10px] font-black uppercase text-red-500 mb-0.5">Chef Instruction</p>
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">"{order.chefInstruction}"</p>
                  </div>
                )}
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2">
                {order.status === 'PENDING' && (
                  <button onClick={() => handleStatusChange(order.id, 'PREPARING')} className="col-span-2 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 active:scale-95 transition">Start Preparing</button>
                )}
                {order.status === 'PREPARING' && (
                  <button onClick={() => handleStatusChange(order.id, 'SERVED')} className="col-span-2 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition">Mark as Served</button>
                )}
                {order.status === 'SERVED' && (
                  <button onClick={() => handleStatusChange(order.id, 'COMPLETED')} className="col-span-2 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm active:scale-95 transition">Complete Order</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'BILLS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden min-h-[400px]">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 font-bold flex items-center justify-between">
               Select Table Bill
               <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">{Object.keys(billingGroups).length} Pending</span>
            </div>
            <div className="p-3 space-y-2">
              {Object.keys(billingGroups).length === 0 && <p className="text-slate-500 text-sm p-4 text-center">No pending bills on the floor.</p>}
              {Object.keys(billingGroups).map(name => {
                const customerOrders = billingGroups[name];
                const tables = Array.from(new Set(customerOrders.map(o => o.table?.tableNumber))).join(', ');
                const total = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                
                return (
                  <button 
                    key={name} 
                    onClick={() => setSelectedName(name)}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${selectedName === name ? 'bg-primary/5 border-primary shadow-sm' : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200">Table {tables}</div>
                      <div className="font-black text-primary text-sm">₹{total.toFixed(0)}</div>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1"><User className="w-3 h-3" /> {name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            {!selectedName ? (
              <div className="h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center p-12 text-slate-400 opacity-80 min-h-[400px]">
                <Receipt className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-medium text-lg">Select a bill from the left</p>
                <p className="text-sm">To generate Admin QR code and collect payment natively</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="flex justify-between items-end mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-2xl font-black leading-none mb-2">Final Bill</h2>
                    <p className="text-slate-500 text-sm font-semibold flex items-center gap-1"><User className="w-4 h-4"/> {selectedName}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                  {billingGroups[selectedName].map(order => (
                    <div key={order.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between font-bold mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 text-xs uppercase tracking-wider">Order #{order.id.slice(-6).toUpperCase()}</span>
                      </div>
                      <ul className="space-y-1">
                        {order.items.map((item: any) => (
                          <li key={item.id} className="flex justify-between font-medium">
                            <span className="text-slate-700 dark:text-slate-300">{item.quantity}x {item.dish.name}</span>
                            <span className="font-bold">₹{(item.price * item.quantity).toFixed(0)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Submitting Payment via Admin UPI */}
                {(() => {
                  const netTotal = billingGroups[selectedName].reduce((sum, o) => sum + o.totalAmount, 0);
                  const upiUrl = `upi://pay?pa=${settings.adminUpiId}&pn=${encodeURIComponent(settings.hotelName)}&am=${netTotal.toFixed(2)}&cu=INR`;
                  const allCompleted = billingGroups[selectedName].every(o => o.status === 'COMPLETED');
                  
                  if (!allCompleted) {
                    return (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-dashed border-amber-200 dark:border-amber-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center mt-6">
                        <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
                        <h3 className="font-bold text-amber-800 dark:text-amber-500 text-lg">Bill Pending</h3>
                        <p className="text-amber-700 dark:text-amber-400 text-sm font-medium mt-1">
                          Some orders for this table are still being prepared or served. You can generate the final bill once all items are marked as COMPLETED.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-1 rounded-2xl shadow-xl overflow-hidden mt-6">
                      <div className="bg-emerald-50 dark:bg-slate-900 rounded-xl p-6 flex flex-col md:flex-row items-center gap-8 justify-between">
                        
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-widest text-xs mb-2">Admin Collection</h3>
                          <div className="text-5xl font-black text-emerald-600 dark:text-emerald-500 mb-2">₹{netTotal.toFixed(0)}</div>
                          <p className="text-sm font-medium text-slate-500 mb-6">Scan QR with PhonePe, GPay, or Paytm</p>
                          
                          <button 
                            onClick={() => handleMarkPaid(billingGroups[selectedName].map(o => o.id))}
                            className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-600 active:scale-95 transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" /> Confirm Payment Received
                          </button>
                        </div>
                        
                        <div className="shrink-0 bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                          {settings.adminUpiId ? (
                            <div className="flex flex-col items-center">
                              <QRCodeSVG value={upiUrl} size={150} />
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3">Verified Merchant</span>
                            </div>
                          ) : (
                            <div className="w-[150px] h-[150px] flex items-center justify-center text-center text-xs text-red-500 font-bold bg-red-50 rounded-lg p-2">
                               Admin UPI Not Configured
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
