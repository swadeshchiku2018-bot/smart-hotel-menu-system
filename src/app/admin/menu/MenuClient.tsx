'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addDish, deleteDish, toggleDishAvailability, updateDish } from '@/actions/dishes';
import { addCategory, deleteCategory } from '@/actions/categories';
import { Layers, Pencil, Check, X, UploadCloud, ImageIcon } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Dish = {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  categoryId: string;
  imageUrl?: string | null;
  isAvailable: boolean;
  hasPortions: boolean;
  halfPrice?: number | null;
  quarterPrice?: number | null;
};
type Category = { id: string; name: string };

// ─── Image Uploader Component ─────────────────────────────────────────────────
function ImageUploader({
  currentUrl,
  onUploaded,
  label = 'Dish Photo',
}: {
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Local preview
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Upload failed');
      }
      const { url } = await res.json();
      onUploaded(url);
    } catch (e: any) {
      setError(e.message ?? 'Upload failed');
      setPreview(currentUrl ?? null);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <label className="block text-sm text-slate-500 mb-2 flex items-center gap-1 font-medium">
        <ImageIcon className="w-3.5 h-3.5" /> {label}
      </label>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all group
          ${uploading ? 'border-primary/60 pointer-events-none' : 'border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5'}`}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-xl" />
            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="text-white text-sm font-semibold flex items-center gap-1">
                <UploadCloud className="w-4 h-4" /> Change Photo
              </span>
            </div>
          </div>
        ) : (
          <div className="h-28 flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-primary transition px-4">
            <UploadCloud className={`w-8 h-8 ${uploading ? 'animate-bounce text-primary' : ''}`} />
            <p className="text-sm font-medium text-center">
              {uploading ? 'Uploading...' : 'Click or drag & drop to upload'}
            </p>
            <p className="text-xs text-slate-400">JPG, PNG, WebP, GIF</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 rounded-xl bg-white/60 dark:bg-slate-900/60 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─── Inline Edit Row per Dish ─────────────────────────────────────────────────
function DishCard({ dish }: { dish: Dish }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(dish.name);
  const [price, setPrice] = useState(dish.price.toString());
  const [description, setDescription] = useState(dish.description ?? '');
  const [imageUrl, setImageUrl] = useState(dish.imageUrl ?? '');
  const [hasPortions, setHasPortions] = useState(dish.hasPortions);
  const [halfPrice, setHalfPrice] = useState(dish.halfPrice?.toString() ?? '');
  const [quarterPrice, setQuarterPrice] = useState(dish.quarterPrice?.toString() ?? '');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    const trimmedName = name.trim();
    const parsedPrice = parseFloat(price);

    if (!trimmedName || isNaN(parsedPrice)) {
      alert('Valid Name and Price are required');
      return;
    }

    setSaving(true);
    try {
      // Safely parse portion prices
      const hPrice = (hasPortions && halfPrice !== '') ? parseFloat(halfPrice) : null;
      const qPrice = (hasPortions && quarterPrice !== '') ? parseFloat(quarterPrice) : null;

      // Guard against NaN values before sending to server
      if (hasPortions && (
        (halfPrice !== '' && isNaN(hPrice as number)) || 
        (quarterPrice !== '' && isNaN(qPrice as number))
      )) {
        alert('Invalid portion prices. Use numbers only.');
        setSaving(false);
        return;
      }

      const result = await updateDish(dish.id, {
        name: trimmedName,
        price: parsedPrice,
        description: description?.trim() || null,
        imageUrl: imageUrl.trim() || null,
        hasPortions,
        halfPrice: hPrice,
        quarterPrice: qPrice,
      });

      if (result?.success) {
        setEditing(false);
        router.refresh();
        alert('Dish updated successfully!');
      } else {
        throw new Error(result?.error || 'Server rejected the update');
      }
    } catch (e: any) {
      console.error('Update operation failed:', e);
      alert('Update failed: ' + (e?.message || 'Check your connection.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setImageUrl(dish.imageUrl ?? '');
    setHasPortions(dish.hasPortions);
    setHalfPrice(dish.halfPrice?.toString() ?? '');
    setQuarterPrice(dish.quarterPrice?.toString() ?? '');
    setEditing(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">

      {/* Image preview (when not editing) */}
      {dish.imageUrl && !editing && (
        <div className="h-36 bg-slate-100 dark:bg-slate-900 overflow-hidden">
          <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{dish.name}</h4>
            {dish.description && (
              <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{dish.description}</p>
            )}
          </div>
          <div className="text-right">
            <span className="font-black text-emerald-500 text-lg">₹{dish.price.toFixed(0)}</span>
            {dish.hasPortions && (
              <div className="flex flex-col text-xs text-slate-400 mt-0.5 items-end gap-0.5">
                {dish.halfPrice != null && <span>Half · ₹{dish.halfPrice.toFixed(0)}</span>}
                {dish.quarterPrice != null && <span>Qtr · ₹{dish.quarterPrice.toFixed(0)}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        {!editing && (
          <div className="flex gap-2 flex-wrap">
            {dish.hasPortions && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-medium">
                <Layers className="w-3 h-3" /> Portions On
              </span>
            )}
            {dish.imageUrl && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium">
                <ImageIcon className="w-3 h-3" /> Photo Set
              </span>
            )}
          </div>
        )}

        {/* Inline edit panel */}
        {editing && (
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1 font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 font-medium">Full Price (₹)</label>
                <input
                  type="number"
                  step="0.5"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1 font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Image upload */}
            <ImageUploader
              currentUrl={imageUrl || null}
              onUploaded={url => setImageUrl(url)}
            />

            {/* Portions toggle */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setHasPortions(v => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${hasPortions ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hasPortions ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Quarter / Half / Full Portions
                </span>
              </label>
            </div>

            {hasPortions && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Half Price (₹)</label>
                  <input type="number" min="0" step="0.5" value={halfPrice} onChange={e => setHalfPrice(e.target.value)} placeholder="e.g. 80"
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Quarter Price (₹)</label>
                  <input type="number" min="0" step="0.5" value={quarterPrice} onChange={e => setQuarterPrice(e.target.value)} placeholder="e.g. 45"
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50" />
                </div>
                <p className="col-span-2 text-xs text-slate-400">Full = ₹{dish.price.toFixed(0)}</p>
              </div>
            )}

            {/* Save / Cancel */}
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60">
                <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg transition hover:bg-slate-200 dark:hover:bg-slate-600">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Footer row */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={dish.isAvailable} 
              onChange={async () => {
                const res = await toggleDishAvailability(dish.id, !dish.isAvailable);
                if (!res.success) alert(res.error);
                else router.refresh();
              }}
              className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" 
            />
            <span className={dish.isAvailable ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>Available</span>
          </label>
          <div className="flex items-center gap-3">
            <button onClick={() => setEditing(v => !v)} className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button 
              onClick={async () => {
                if(confirm('Really delete this dish?')) {
                  const res = await deleteDish(dish.id);
                  if(!res.success) alert(res.error);
                  else router.refresh();
                }
              }} 
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Menu Client ───────────────────────────────────────────────────
export default function MenuClient({ initialDishes, initialCategories }: { initialDishes: Dish[], initialCategories: Category[] }) {
  const router = useRouter();

  const [newCat, setNewCat] = useState('');
  const [catLoading, setCatLoading] = useState(false);

  // Dish form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [hasPortions, setHasPortions] = useState(false);
  const [halfPrice, setHalfPrice] = useState('');
  const [quarterPrice, setQuarterPrice] = useState('');
  const [dishLoading, setDishLoading] = useState(false);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    setCatLoading(true);
    await addCategory(newCat.trim());
    setNewCat('');
    setCatLoading(false);
    router.refresh(); // 🔑 refresh server data so new category appears immediately
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    router.refresh();
  };

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) return;
    setDishLoading(true);
    try {
      const res = await addDish({
        name,
        price: parseFloat(price),
        description: description?.trim() || null,
        categoryId,
        imageUrl: imageUrl || null,
        hasPortions,
        halfPrice: (hasPortions && halfPrice) ? parseFloat(halfPrice) : null,
        quarterPrice: (hasPortions && quarterPrice) ? parseFloat(quarterPrice) : null,
      });

      if (res.success) {
        setName(''); setPrice(''); setDescription(''); setImageUrl('');
        setHasPortions(false); setHalfPrice(''); setQuarterPrice('');
        router.refresh();
        alert('Dish added successfully!');
      } else {
        alert('Error: ' + res.error);
      }
    } catch (err: any) {
      alert('Operation failed. Please check your connection.');
    } finally {
      setDishLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* ── Sidebar Forms ── */}
      <div className="lg:col-span-1 space-y-6">

        {/* Add Category */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-semibold mb-4 text-slate-800 dark:text-slate-100">Add Category</h3>
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="e.g. Starters"
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm" required />
            <button type="submit" disabled={catLoading}
              className="px-4 py-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50">
              {catLoading ? '...' : 'Add'}
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {initialCategories.map(cat => (
              <span key={cat.id} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium">
                {cat.name}
                <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 ml-1 leading-none">&times;</button>
              </span>
            ))}
          </div>
        </div>

        {/* Add Dish Form */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-semibold mb-4 text-slate-800 dark:text-slate-100">Add New Dish</h3>
          <form onSubmit={handleAddDish} className="space-y-4">

            <div>
              <label className="block text-sm text-slate-500 mb-1">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent" />
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-1">Full Price (₹)</label>
              <input type="number" step="0.5" min="0" value={price} onChange={e => setPrice(e.target.value)} required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent" />
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-1">Description (Optional)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent" />
            </div>

            {/* ── Image Upload ── */}
            <ImageUploader
              currentUrl={imageUrl || null}
              onUploaded={url => setImageUrl(url)}
              label="Dish Photo (Optional)"
            />

            <div>
              <label className="block text-sm text-slate-500 mb-1">Category</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                <option value="">Select a category</option>
                {initialCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* ── Portions ── */}
            <div className="border border-amber-200 dark:border-amber-800 rounded-xl p-4 bg-amber-50 dark:bg-amber-900/20 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div onClick={() => setHasPortions(v => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${hasPortions ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hasPortions ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  <Layers className="w-3.5 h-3.5 inline mr-1 text-amber-500" /> Enable Portion Sizes
                </span>
              </label>

              {hasPortions && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Half Price (₹)</label>
                    <input type="number" step="0.5" min="0" value={halfPrice} onChange={e => setHalfPrice(e.target.value)} placeholder="e.g. 80"
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Quarter Price (₹)</label>
                    <input type="number" step="0.5" min="0" value={quarterPrice} onChange={e => setQuarterPrice(e.target.value)} placeholder="e.g. 45"
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800" />
                  </div>
                  <p className="col-span-2 text-xs text-slate-400">Full = ₹{price || '0'} (set above)</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={dishLoading}
              className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
              {dishLoading ? 'Adding...' : 'Add Dish'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Dishes List ── */}
      <div className="lg:col-span-2">
        {initialCategories.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-slate-500">
            Please add a category first.
          </div>
        ) : (
          initialCategories.map(cat => {
            const catDishes = initialDishes.filter(d => d.categoryId === cat.id);
            return (
              <div key={cat.id} className="mb-10">
                <h2 className="text-xl font-bold mb-4 border-b pb-2 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  {cat.name}
                  <span className="text-sm font-normal text-slate-400">({catDishes.length} dishes)</span>
                </h2>
                {catDishes.length === 0 ? (
                  <p className="text-slate-400 text-sm">No dishes yet in this category.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {catDishes.map(dish => <DishCard key={dish.id} dish={dish} />)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
