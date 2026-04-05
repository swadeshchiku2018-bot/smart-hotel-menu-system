'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

export default function AccountsClient({ users }: { users: any[] }) {
  const [waiterName, setWaiterName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="max-w-4xl space-y-8">
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
              <th className="px-6 py-3 font-semibold">Username / Email</th>
              <th className="px-6 py-3 font-semibold">Role</th>
              <th className="px-6 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                  {u.name || u.email || 'Unknown'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {u.role !== 'ADMIN' && (
                    <button onClick={() => handleDeleteWaiter(u.id)} className="text-red-500 hover:text-red-400 p-2">
                       <Trash2 className="w-4 h-4" />
                    </button>
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
