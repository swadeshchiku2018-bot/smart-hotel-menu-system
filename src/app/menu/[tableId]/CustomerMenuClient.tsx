'use client';

import { useState } from 'react';
import { createOrder } from '@/actions/orders';
import { ShoppingBag, Minus, Plus, X, Utensils, ArrowRight, Flame, Layers } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Fallback images for seeded dishes that don't have an imageUrl in DB yet
function getDishImage(dish: { name: string; imageUrl?: string | null }): string | null {
  if (dish.imageUrl) return dish.imageUrl;
  const n = dish.name.toLowerCase();
  if (n.includes('pizza')) return '/api/images/pizza';
  if (n.includes('garlic')) return '/api/images/garlic-bread';
  return null;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Portion = 'Quarter' | 'Half' | 'Full';
type CartItem = { quantity: number; portion: Portion };

type Dish = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  hasPortions: boolean;
  halfPrice?: number | null;
  quarterPrice?: number | null;
};

type Category = { id: string; name: string };

// ─── Helper: get price for a portion ─────────────────────────────────────────
function getPortionPrice(dish: Dish, portion: Portion): number {
  if (!dish.hasPortions) return dish.price;
  if (portion === 'Half' && dish.halfPrice != null) return dish.halfPrice;
  if (portion === 'Quarter' && dish.quarterPrice != null) return dish.quarterPrice;
  return dish.price; // Full
}

// ─── Portion Selector Pill ────────────────────────────────────────────────────
function PortionPill({
  dish,
  selected,
  onSelect,
}: {
  dish: Dish;
  selected: Portion;
  onSelect: (p: Portion) => void;
}) {
  const options: { label: Portion; price: number | null }[] = [
    { label: 'Quarter', price: dish.quarterPrice ?? null },
    { label: 'Half', price: dish.halfPrice ?? null },
    { label: 'Full', price: dish.price },
  ];

  return (
    <div className="flex gap-1 mt-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-full">
      {options.map(opt => {
        if (opt.label !== 'Full' && opt.price == null) return null;
        const active = selected === opt.label;
        return (
          <button
            key={opt.label}
            onClick={() => onSelect(opt.label)}
            className={`flex-1 py-1.5 px-2 rounded-full text-xs font-bold transition-all ${active
              ? 'bg-amber-500 text-white shadow-md shadow-amber-400/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
          >
            {opt.label}
            <br />
            <span className={`font-normal text-[10px] ${active ? 'text-amber-100' : 'text-slate-400'}`}>
              ₹{opt.price?.toFixed(0)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CustomerMenuClient({
  table,
  dishes,
  categories,
  hotelName = 'LUXE DINING',
}: {
  table: any;
  dishes: Dish[];
  categories: Category[];
  hotelName?: string;
}) {
  // cart: dishId → { quantity, portion }
  const [cart, setCart] = useState<{ [dishId: string]: CartItem }>({});
  // active category filter
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(categories.length > 0 ? categories[0].id : null);
  // pending portion selection per dish (before adding to cart)
  const [selectedPortion, setSelectedPortion] = useState<{ [dishId: string]: Portion }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [chefInstruction, setChefInstruction] = useState('');

  // ── Derived ──────────────────────────────────────────────────────────────
  const cartEntries = Object.entries(cart);
  const cartTotalItems = cartEntries.reduce((a, [, v]) => a + v.quantity, 0);
  const cartSubtotal = cartEntries.reduce((sum, [dishId, { quantity, portion }]) => {
    const dish = dishes.find(d => d.id === dishId);
    return sum + (dish ? getPortionPrice(dish, portion) * quantity : 0);
  }, 0);

  // ── Cart Mutation ─────────────────────────────────────────────────────────
  const getPortion = (dishId: string, dish: Dish): Portion =>
    selectedPortion[dishId] ?? (dish.hasPortions ? 'Full' : 'Full');

  const addToCart = (dish: Dish) => {
    const portion = getPortion(dish.id, dish);
    setCart(prev => {
      const existing = prev[dish.id];
      // If same portion exists, increment; otherwise replace (portion change resets qty to 1)
      if (existing && existing.portion === portion) {
        return { ...prev, [dish.id]: { quantity: existing.quantity + 1, portion } };
      }
      return { ...prev, [dish.id]: { quantity: 1, portion } };
    });
  };

  const updateQty = (dishId: string, delta: number) => {
    setCart(prev => {
      const existing = prev[dishId];
      if (!existing) return prev;
      const next = existing.quantity + delta;
      const newCart = { ...prev };
      if (next <= 0) {
        delete newCart[dishId];
      } else {
        newCart[dishId] = { ...existing, quantity: next };
      }
      return newCart;
    });
  };

  const removeFromCart = (dishId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[dishId];
      return newCart;
    });
  };

  // ── Place Order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (cartTotalItems === 0) return;
    if (!mobileNumber || mobileNumber.length < 10) {
      alert("Please enter a valid 10-digit mobile number to track our bill.");
      return;
    }
    setIsSubmitting(true);
    try {
      const items = cartEntries.map(([dishId, { quantity, portion }]) => {
        const dish = dishes.find(d => d.id === dishId)!;
        return { dishId, quantity, price: getPortionPrice(dish, portion), portion };
      });

      // Only use demo simulation for preview URLs, never for real table UUIDs
      if (table.id.startsWith('demo-table-')) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setOrderSuccess(true);
        setCart({});
        setIsCartOpen(false);
        setIsSubmitting(false);
        return;
      }

      const result = await createOrder(table.id, items, mobileNumber, chefInstruction);
      if (result?.success) {
        setCart({});
        setIsCartOpen(false);
        setOrderSuccess(true);
      } else {
        throw new Error(result?.error || 'Server rejected the order');
      }
    } catch (e: any) {
      console.error('Order placement failed:', e);
      alert('Failed to place order: ' + (e?.message || 'Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Order Success Screen ──────────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full border border-white/20 dark:border-slate-700/50"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 text-5xl shadow-lg shadow-emerald-500/30"
          >
            ✓
          </motion.div>
          <h2 className="text-3xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
            Order Placed!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-10 font-medium">
            Your chef is preparing your meal. It will be served to Table {table.tableNumber} shortly.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOrderSuccess(false)}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 dark:shadow-white/10"
          >
            Order More
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── Main Menu ─────────────────────────────────────────────────────────────
  return (
    <div className="pb-32 min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-primary/30 text-slate-800 dark:text-slate-100">

      {/* Hero Header */}
      <div className="relative h-64 md:h-[400px] w-full overflow-hidden rounded-b-[3rem] shadow-2xl">
        <div className="absolute inset-0 bg-slate-900">
          <img src="/api/images/hero" className="w-full h-full object-cover opacity-60 mix-blend-overlay" alt="Restaurant Interior" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

        <header className="absolute top-0 left-0 right-0 z-20 px-6 py-6 flex justify-between items-center text-white">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg flex items-center gap-2">
            <Utensils className="w-4 h-4 text-primary" />
            <span className="font-bold tracking-wide uppercase">{hotelName}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="relative bg-white/10 backdrop-blur-md p-3 rounded-full text-white border border-white/10 shadow-lg"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartTotalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg"
              >
                {cartTotalItems}
              </motion.span>
            )}
          </motion.button>
        </header>

        <div className="absolute bottom-10 left-6 right-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <p className="text-primary font-bold tracking-widest text-sm uppercase mb-2 ml-1">Welcome to</p>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-2 drop-shadow-md">
              Table {table.tableNumber}
            </h1>
            <p className="text-slate-300 font-medium max-w-sm ml-1 opacity-90 text-sm md:text-base">
              Explore our curated digital menu and order seamlessly from your table.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Category Nav - Sticky */}
      <div className="sticky top-0 z-50 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl px-6 py-4 shadow-sm border-b border-slate-200 dark:border-slate-800 -mt-10 overflow-x-auto no-scrollbar flex gap-6 items-start scroll-smooth">
        {categories.map((cat, idx) => {
          const catImgSrc = `/api/images/${cat.name.toLowerCase().replace(/ /g, '-')}`;
          const isActive = activeCategoryId === cat.id;
          return (
            <motion.button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer focus:outline-none"
            >
              <div className={`w-20 h-20 rounded-full bg-white dark:bg-slate-800 p-1 shadow-lg transition-all duration-300 ${isActive ? 'ring-4 ring-primary ring-offset-2 dark:ring-offset-slate-900 scale-105' : 'group-hover:shadow-xl group-hover:scale-105'}`}>
                <img
                  src={catImgSrc}
                  alt={cat.name}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/api/images/hero';
                  }}
                />
              </div>
              <span className={`text-xs font-black transition-colors ${isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-400 group-hover:text-primary'}`}>
                {cat.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Menu Sections (Filtered) */}
      <main className="p-6 max-w-4xl mx-auto space-y-12 relative z-10 pt-8">
        {categories.filter(c => activeCategoryId ? c.id === activeCategoryId : true).map((cat, idx) => {
          const catDishes = dishes.filter(d => d.categoryId === cat.id);
          if (catDishes.length === 0) return null;
          return (
            <motion.div
              key={cat.id}
              id={`cat-${cat.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="scroll-mt-32"
            >
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{cat.name}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-800" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {catDishes.map(dish => {
                  const inCart = !!cart[dish.id];
                  const currentPortion = getPortion(dish.id, dish);
                  const displayPrice = getPortionPrice(dish, currentPortion);

                  return (
                    <motion.div
                      whileHover={{ y: -5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      key={dish.id}
                      className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm hover:shadow-xl dark:border dark:border-slate-800 transition-all duration-300 flex flex-col overflow-hidden group"
                    >
                      {/* Dish Image — uses stored imageUrl, falls back to name-based match for seeded dishes */}
                      {(() => {
                        const imgSrc = getDishImage(dish);
                        return imgSrc ? (
                          <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                            <img
                              src={imgSrc}
                              alt={dish.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                            {dish.hasPortions && (
                              <span className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <Layers className="w-3 h-3" /> Portions
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 relative">
                            {dish.hasPortions && (
                              <span className="absolute top-2 right-3 bg-amber-500/90 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <Layers className="w-3 h-3" /> Portions
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <h3 className="font-bold text-xl leading-tight text-slate-800 dark:text-slate-100">
                            {dish.name}
                          </h3>
                          <span className="font-black text-lg text-primary bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
                            ₹{displayPrice.toFixed(0)}
                          </span>
                        </div>

                        {dish.description && (
                          <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 leading-relaxed">{dish.description}</p>
                        )}

                        {/* Portion Selector */}
                        {dish.hasPortions && (
                          <PortionPill
                            dish={dish}
                            selected={currentPortion}
                            onSelect={p => {
                              setSelectedPortion(prev => ({ ...prev, [dish.id]: p }));
                              // If already in cart, update portion + reset qty to 1
                              if (cart[dish.id]) {
                                setCart(prev => ({ ...prev, [dish.id]: { quantity: 1, portion: p } }));
                              }
                            }}
                          />
                        )}

                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 mt-4">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            {inCart ? `In Cart${dish.hasPortions ? ` · ${cart[dish.id].portion}` : ''}` : 'Fresh'}
                          </span>

                          {!inCart ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => addToCart(dish)}
                              className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition flex items-center gap-2"
                            >
                              Add <ArrowRight className="w-4 h-4" />
                            </motion.button>
                          ) : (
                            <div className="flex items-center gap-3 bg-primary text-white rounded-full p-1.5 shadow-lg shadow-primary/30">
                              <button onClick={() => updateQty(dish.id, -1)} className="p-2 rounded-full hover:bg-white/20 transition">
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold w-6 text-center tabular-nums">{cart[dish.id].quantity}</span>
                              <button onClick={() => updateQty(dish.id, 1)} className="p-2 rounded-full hover:bg-white/20 transition">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </main>

      {/* Floating Bottom Button */}
      <AnimatePresence>
        {cartTotalItems > 0 && !isCartOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 px-6 flex justify-center z-30"
          >
            <motion.button
              onClick={() => setIsCartOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-2 pr-6 rounded-full font-bold shadow-2xl shadow-slate-900/20 dark:shadow-white/10 flex items-center gap-4 w-full max-w-sm backdrop-blur-xl border border-white/10"
            >
              <span className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-lg shadow-inner">
                {cartTotalItems}
              </span>
              <span className="flex-1 text-left text-lg pl-2">View Order</span>
              <span className="text-lg tabular-nums">₹{cartSubtotal.toFixed(0)}</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-[2.5rem] z-50 max-h-[90vh] flex flex-col shadow-2xl border-t border-slate-200 dark:border-slate-800"
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />

              <div className="p-8 pb-4 flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white">Your Cart</h2>
                  <p className="text-slate-500 font-medium mt-1">Table {table.tableNumber}</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-3 text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto px-8 py-4 flex-1 space-y-5">
                {cartEntries.length === 0 ? (
                  <div className="text-center text-slate-500 py-12 font-medium">
                    Your cart is empty. Try adding our delicious dishes!
                  </div>
                ) : (
                  cartEntries.map(([dishId, { quantity, portion }]) => {
                    const dish = dishes.find(d => d.id === dishId);
                    if (!dish) return null;
                    const unitPrice = getPortionPrice(dish, portion);
                    const cartImgSrc = dish.imageUrl || getDishImage(dish);
                    return (
                      <div key={dishId} className="flex gap-4 items-center">
                        {cartImgSrc ? (
                          <img src={cartImgSrc} className="w-20 h-20 rounded-2xl object-cover shadow-sm bg-slate-100 dark:bg-slate-800 flex-shrink-0" alt={dish.name} />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <Utensils className="w-8 h-8 text-slate-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg leading-tight mb-0.5 truncate">{dish.name}</h4>
                          {dish.hasPortions && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 mb-1">
                              <Layers className="w-3 h-3" /> {portion}
                            </span>
                          )}
                          <div className="text-primary font-black">₹{unitPrice.toFixed(0)}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button onClick={() => removeFromCart(dishId)} className="text-slate-300 hover:text-red-400 transition">
                            <X className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-full px-2 py-1 border border-slate-100 dark:border-slate-700">
                            <button onClick={() => updateQty(dishId, -1)} className="p-1 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold w-5 text-center tabular-nums text-sm">{quantity}</span>
                            <button onClick={() => updateQty(dishId, 1)} className="p-1 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {cartTotalItems > 0 && (
                <div className="p-8 pt-6 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl">
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                       Your Mobile Number (For Billing)
                    </label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 9876543210" 
                      value={mobileNumber}
                      onChange={e => setMobileNumber(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 group-hover:border-primary transition font-mono"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                       Instructions for Chef (Optional)
                    </label>
                    <textarea 
                      placeholder="e.g. Less spicy, no onions, etc." 
                      value={chefInstruction}
                      onChange={e => setChefInstruction(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 group-hover:border-primary transition font-sans resize-none h-20"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-sm">Total Amount</span>
                    <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">₹{cartSubtotal.toFixed(0)}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="w-full py-5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl font-black text-lg disabled:opacity-50 shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Sending to Kitchen...</span>
                    ) : (
                      <>Place Order Now <ArrowRight className="w-5 h-5" /></>
                    )}
                  </motion.button>
                  <p className="text-center text-xs text-slate-400 mt-4 font-medium flex items-center justify-center gap-1">
                    <Flame className="w-3 h-3" /> Freshly prepared upon order
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
