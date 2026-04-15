'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

export default function AccountsClient({ users, tables = [] }: { users: any[], tables?: any[] }) {
  const [waiterName, setWaiterName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState<string | null>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const router = useRouter();

  const handleCreateWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/admin/waiters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: waiterName, password })
      });
      
      if (res.ok) {
        setWaiterName('');
        setPassword('');
        router.refresh();
      } else {
        alert('Failed to create waiter.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWaiter = async (id: string) => {
    if (!confirm('Remove this waiter?')) return;
    await fetch(`/api/admin/waiters?id=${id}`, { method: 'DELETE' });
    router.refresh();
  };

  const handleEditTables = (userId: string, currentTables: any[]) => {
    setEditingWaiter(userId);
    setSelectedTables(currentTables.map((t: any) => t.id));
  };

  const handleSaveTables = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/waiters/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waiterId: userId, tableIds: selectedTables })
      });
      if (res.ok) {
        setEditingWaiter(null);
        router.refresh();
      } else {
        alert('Failed to assign tables.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleTable = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) ? prev.filter(id => id !== tableId) : [...prev, tableId]
    );
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">Create New Waiter</h2>
        <form onSubmit={handleCreateWaiter} className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Waiter Username</label>
            <input
              type="text"
              required
              value={waiterName}
              onChange={e => setWaiterName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm"
              placeholder="E.g. waiter1"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Temporary Password</label>
            <input
              type="text"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-transparent text-sm"
              placeholder="Secure password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 h-[42px] bg-primary text-white rounded-lg font-bold flex items-center gap-2 hover:bg-opacity-90 transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Waiter
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-bold text-lg">Active Personnel Accounts</h3>
        </div>
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 font-semibold w-1/4">Username / Email</th>
              <th className="px-6 py-3 font-semibold w-1/4">Role</th>
              <th className="px-6 py-3 font-semibold w-1/3">Assigned Tables</th>
              <th className="px-6 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 align-top">
                  {u.name || u.email || 'Unknown'}
                </td>
                <td className="px-6 py-4 align-top">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 align-top whitespace-normal">
                  {u.role === 'ADMIN' ? (
                     <span className="text-slate-400 italic">Has access to all tables</span>
                  ) : editingWaiter === u.id ? (
                     <div className="flex flex-wrap gap-2">
                       {tables.map(t => (
                         <label key={t.id} className="flex items-center gap-1.5 p-2 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                           <input 
                             type="checkbox" 
                             checked={selectedTables.includes(t.id)} 
                             onChange={() => toggleTable(t.id)}
                             className="w-4 h-4 text-primary rounded focus:ring-primary"
                           />
                           <span className="font-medium text-sm">Table {t.tableNumber}</span>
                         </label>
                       ))}
                     </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {u.tables && u.tables.length > 0 ? (
                        u.tables.map((t: any) => (
                          <span key={t.id} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-bold border border-primary/20">
                            T-{t.tableNumber}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic text-xs">No tables assigned</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right align-top flex justify-end gap-2">
                  {u.role !== 'ADMIN' && (
                    <>
                      {editingWaiter === u.id ? (
                        <>
                          <button onClick={() => setEditingWaiter(null)} disabled={loading} className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 dark:bg-slate-700 rounded-lg transition disabled:opacity-50">
                            <X className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleSaveTables(u.id)} disabled={loading} className="px-3 py-2 text-white bg-primary hover:bg-opacity-90 rounded-lg font-bold text-xs flex items-center gap-1 transition disabled:opacity-50">
                             <Save className="w-4 h-4" /> Save
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleEditTables(u.id, u.tables || [])} className="p-2 text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      
                      {editingWaiter !== u.id && (
                        <button onClick={() => handleDeleteWaiter(u.id)} className="p-2 text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg transition">
                           <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
