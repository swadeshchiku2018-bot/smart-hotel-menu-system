'use client';

import { useState } from 'react';
import { createOrder } from '@/actions/orders';
import { ShoppingBag, Minus, Plus, X, Layers, Phone, MapPin, ArrowRight } from 'lucide-react';

export default function WaiterCreateOrderClient({ dishes, tables, defaultTable = '', defaultMobile = '' }: { dishes: any[], tables: any[], defaultTable?: string, defaultMobile?: string }) {
  const [selectedTable, setSelectedTable] = useState(defaultTable);
  const [customerName, setCustomerName] = useState(defaultMobile);
  const [chefInstruction, setChefInstruction] = useState('');
  const [cart, setCart] = useState<{ [dishId: string]: { quantity: number, portion?: string } }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const cartEntries = Object.entries(cart);
  const cartTotalItems = cartEntries.reduce((a, [, v]) => a + v.quantity, 0);
  
  const getPortionPrice = (dish: any, portion: string = 'Full') => {
    if (!dish.hasPortions) return dish.price;
    if (portion === 'Half' && dish.halfPrice != null) return dish.halfPrice;
    if (portion === 'Quarter' && dish.quarterPrice != null) return dish.quarterPrice;
    return dish.price;
  };

  const getSubtotal = () => cartEntries.reduce((sum, [dishId, { quantity, portion }]) => {
    const dish = dishes.find(d => d.id === dishId);
    return sum + (dish ? getPortionPrice(dish, portion) * quantity : 0);
  }, 0);

  const updateQty = (dish: any, delta: number, portion = 'Full') => {
    setCart(prev => {
      const existing = prev[dish.id];
      const nextQty = existing ? existing.quantity + delta : delta;
      
      if (nextQty <= 0) {
        const nextCart = { ...prev };
        delete nextCart[dish.id];
        return nextCart;
      }
      return { ...prev, [dish.id]: { quantity: nextQty, portion } };
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedTable) return alert('Please select a table.');
    if (!customerName || customerName.trim() === '') return alert('Please enter a customer name.');
    if (cartTotalItems === 0) return alert('Cart is empty.');

    setIsSubmitting(true);
    try {
      const items = cartEntries.map(([dishId, { quantity, portion }]) => {
        const dish = dishes.find(d => d.id === dishId);
        return { dishId, quantity, price: getPortionPrice(dish, portion), portion };
      });

      const res = await createOrder(selectedTable, items, customerName.trim(), chefInstruction);
      if (res?.success) {
        alert('Order placed successfully!');
        setCart({});
        setCustomerName('');
        setChefInstruction('');
        setSelectedTable('');
      } else {
        alert('Failed to place order.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Menu / Items Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" /> Point of Sale Menu
          </h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-4 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-full bg-white dark:bg-slate-900 focus:outline-none focus:border-primary text-sm"
            />
          </div>
        </div>
        
        {/* Category Nav */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition ${activeCategory === 'All' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
          >
            All
          </button>
          {Array.from(new Set(dishes.map(d => d.category?.name || 'Uncategorized'))).map(catName => (
            <button 
              key={catName}
              onClick={() => setActiveCategory(catName as string)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition ${activeCategory === catName ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
            >
              {catName as string}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {dishes
            .filter(d => activeCategory === 'All' || (d.category?.name || 'Uncategorized') === activeCategory)
            .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(dish => (
            <div key={dish.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex flex-col items-center text-center hover:border-primary/50 cursor-pointer transition"
                 onClick={() => updateQty(dish, 1)}
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 mb-3 overflow-hidden shadow-inner">
                {dish.imageUrl ? (
                  <img src={dish.imageUrl} className="w-full h-full object-cover" alt={dish.name}/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-300">No Img</div>
                )}
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1 leading-tight">{dish.name}</h3>
              <div className="text-primary font-black text-sm">₹{dish.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* POS Cart & Details */}
      <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col max-h-[85vh] sticky top-24">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 space-y-4">
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><MapPin className="w-3 h-3"/> Assign to Table</label>
            <select 
              value={selectedTable} 
              onChange={e => setSelectedTable(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-2 px-3 focus:outline-none focus:border-primary font-bold text-sm"
            >
              <option value="">-- Select Table --</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>Table {t.tableNumber}</option>
              ))}
            </select>
          </div>

          <div>
             <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1"><Layers className="w-3 h-3"/> Customer Name</label>
             <input 
               type="text"
               placeholder="Customer Name"
               value={customerName}
               onChange={e => setCustomerName(e.target.value)}
               className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-2 px-3 focus:outline-none focus:border-primary font-bold text-sm tracking-wider"
             />
          </div>

          <div>
             <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">Chef Instructions</label>
             <textarea 
               placeholder="Optional instructions..."
               value={chefInstruction}
               onChange={e => setChefInstruction(e.target.value)}
               className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg py-2 px-3 focus:outline-none focus:border-primary text-sm resize-none h-16"
             />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 p-3">
           {cartTotalItems === 0 && <p className="text-center text-slate-400 text-sm py-10 font-medium">Cart is empty. Tap items to add.</p>}
           
           {cartEntries.map(([dishId, { quantity, portion }]) => {
             const dish = dishes.find(d => d.id === dishId);
             if (!dish) return null;
             
             return (
               <div key={dishId} className="flex justify-between items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{dish.name}</h4>
                    <div className="text-primary font-bold text-xs">₹{getPortionPrice(dish, portion)}</div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 p-0.5">
                    <button onClick={() => updateQty(dish, -1)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><Minus className="w-3 h-3" /></button>
                    <span className="font-bold text-xs w-4 text-center tabular-nums">{quantity}</span>
                    <button onClick={() => updateQty(dish, 1)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><Plus className="w-3 h-3" /></button>
                  </div>
               </div>
             )
           })}
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
           <div className="flex justify-between font-black text-xl mb-4">
             <span>Total</span>
             <span>₹{getSubtotal()}</span>
           </div>
           
           <button 
             onClick={handlePlaceOrder}
             disabled={isSubmitting || cartTotalItems === 0}
             className="w-full py-4 bg-primary text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg hover:active:scale-95 transition disabled:opacity-50"
           >
             {isSubmitting ? 'Processing...' : 'Submit Override Order'} <ArrowRight className="w-4 h-4"/>
           </button>
        </div>
      </div>
    </div>
  );
}
