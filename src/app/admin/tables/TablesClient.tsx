'use client';

import { useState } from 'react';
import { addTable, deleteTable } from '@/actions/tables';

export default function TablesClient({ initialTables }: { initialTables: any[] }) {
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber) return;
    setLoading(true);
    try {
      await addTable(parseInt(tableNumber), window.location.origin);
      setTableNumber('');
    } catch (error: any) {
      alert("Failed to add table! It may already exist (table numbers must be unique) or there was a server error.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Table Form */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Add New Table</h2>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Table Number (e.g. 1)"
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Table'}
          </button>
        </form>
      </div>

      {/* Tables List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialTables.map((table) => (
          <div key={table.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4">Table {table.tableNumber}</h3>
            {table.qrCodeUrl && (
              <div className="bg-white p-2 rounded-lg mb-4">
                <img src={table.qrCodeUrl} alt={`QR Code for Table ${table.tableNumber}`} className="w-48 h-48" />
              </div>
            )}
            <div className="flex gap-2 w-full mt-auto">
              <a 
                href={table.qrCodeUrl} 
                download={`table-${table.tableNumber}-qr.png`}
                className="flex-1 text-center py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition"
              >
                Download QR
              </a>
              <button 
                onClick={() => deleteTable(table.id)}
                className="flex-1 py-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {initialTables.length === 0 && (
          <p className="col-span-full text-slate-500 text-center py-12">No tables added yet.</p>
        )}
      </div>
    </div>
  );
}
