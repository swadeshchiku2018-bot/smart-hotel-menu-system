'use client';

import { useState } from 'react';
import { updateOrderStatus } from '@/actions/orders';
import { QrCode, Phone, Receipt, User, Search, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function BillingClient({ orders, hotelName, adminUpiId }: { orders: any[], hotelName: string, adminUpiId: string }) {
  const [searchName, setSearchName] = useState('');
  const [selectedName, setSelectedName] = useState<string | null>(null);

  // Group UNPAID orders by name and table id
  // Note: Only orders that have a name and are UNPAID
  const unpaidOrders = orders.filter(o => o.paymentStatus !== 'PAID' && o.customerName);
  
  const groups: Record<string, typeof orders> = {};
  unpaidOrders.forEach(o => {
    const key = `${o.customerName}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(o);
  });

  const filteredGroups = Object.keys(groups).filter(name => name.toLowerCase().includes(searchName.toLowerCase()));

  const handleMarkPaid = async (orderIds: string[]) => {
    // Ideally we would update paymentStatus=PAID for all these orders. 
    // Since our updateOrderStatus only updates status, we can add updateOrderPaymentStatus to actions.
    // We'll call updateOrderPaymentStatus in a moment.
    for (const id of orderIds) {
      await fetch('/api/billing/mark-paid', { method: 'POST', body: JSON.stringify({ orderId: id }) });
    }
    window.location.reload();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* List of Customers with Unpaid Bills */}
      <div className="md:col-span-1 border-r border-slate-200 dark:border-slate-800 pr-6 min-h-[500px]">
        <div className="mb-4 relative">
          <input 
            type="text" 
            placeholder="Search customer name..." 
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        
        <h3 className="font-bold text-slate-500 uppercase text-xs tracking-wider mb-4">Pending Bills</h3>
        <div className="space-y-3">
          {filteredGroups.length === 0 && <p className="text-sm text-slate-400">No pending bills found.</p>}
          {filteredGroups.map(name => {
            const customerOrders = groups[name];
            const tables = Array.from(new Set(customerOrders.map(o => o.table?.tableNumber))).join(', ');
            const total = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
            
            return (
              <button 
                key={name} 
                onClick={() => setSelectedName(name)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedName === name ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold flex items-center gap-2"><User className="w-3.5 h-3.5 text-slate-400" /> {name}</div>
                  <div className="font-black text-primary">₹{total.toFixed(0)}</div>
                </div>
                <div className="text-xs text-slate-500 font-medium">Table(s): {tables}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bill Processing Area */}
      <div className="md:col-span-2">
        {!selectedName ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
            <Receipt className="w-16 h-16 mb-4" />
            <p>Select a customer bill to process payment</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h2 className="text-2xl font-black mb-1">Customer Bill</h2>
                <p className="text-slate-500 font-medium flex items-center gap-1"><User className="w-4 h-4"/> {selectedName}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {groups[selectedName].map(order => (
                <div key={order.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm border border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between font-bold mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span>Order #{order.id.slice(-6).toUpperCase()}</span>
                    <span>₹{order.totalAmount.toFixed(0)}</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                    {order.items.map((item: any) => (
                      <li key={item.id} className="flex justify-between">
                        <span>{item.quantity}x {item.dish.name}</span>
                        <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Total and QR Code */}
            {(() => {
              const netTotal = groups[selectedName].reduce((sum, o) => sum + o.totalAmount, 0);
              const upiUrl = `upi://pay?pa=${adminUpiId}&pn=${encodeURIComponent(hotelName)}&am=${netTotal.toFixed(2)}&cu=INR`;
              const allCompleted = groups[selectedName].every(o => o.status === 'COMPLETED');
              
              if (!allCompleted) {
                return (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-dashed border-amber-200 dark:border-amber-800/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center mt-6">
                    <h3 className="font-bold text-amber-800 dark:text-amber-500 text-lg">Bill Pending</h3>
                    <p className="text-amber-700 dark:text-amber-400 text-sm font-medium mt-1">
                      Some orders for this customer are still in progress. The bill can be processed when all items are COMPLETED.
                    </p>
                  </div>
                );
              }

              return (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 text-center flex flex-col items-center">
                  <h3 className="text-slate-600 dark:text-slate-400 font-bold mb-1 uppercase tracking-wider text-sm">Net Payable Amount</h3>
                  <div className="text-5xl font-black text-emerald-600 mb-6 drop-shadow-sm">₹{netTotal.toFixed(0)}</div>
                  
                  {adminUpiId ? (
                    <div className="bg-white p-4 rounded-xl shadow-lg inline-block border-2 border-emerald-500 mb-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-[10px] font-bold text-center uppercase py-0.5 tracking-wider">Scan to Pay</div>
                      <div className="mt-4">
                        <QRCodeSVG value={upiUrl} size={180} />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-100 text-amber-800 p-4 rounded-lg mb-6 text-sm font-medium">
                      Admin UPI ID is not configured. Please set it in Settings.
                    </div>
                  )}

                  <button 
                    onClick={() => handleMarkPaid(groups[selectedName].map(o => o.id))}
                    className="w-full md:w-auto px-8 py-4 bg-slate-900 dark:bg-emerald-500 text-white font-bold rounded-xl shadow-xl hover:scale-105 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" /> Mark as Paid
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
