'use client';

import { useState } from 'react';
import { updateSettings } from '@/actions/settings';
import { useRouter } from 'next/navigation';
import { Save, AlertTriangle, Key, Image as ImageIcon } from 'lucide-react';

export default function SettingsClient({ initialHotelName, initialUpiId }: { initialHotelName: string, initialUpiId: string }) {
  const [hotelName, setHotelName] = useState(initialHotelName);
  const [adminUpiId, setAdminUpiId] = useState(initialUpiId);
  const [isSaving, setIsSaving] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  // Credentials
  const [credUsername, setCredUsername] = useState('admin');
  const [credPassword, setCredPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

  // Background
  const [bgFilePreview, setBgFilePreview] = useState<string | null>(null);
  const [bgFileObject, setBgFileObject] = useState<File | null>(null);

  const router = useRouter();

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data: any = { hotelName, adminUpiId };
      
      if (bgFileObject) {
        const formData = new FormData();
        formData.append('image', bgFileObject);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to upload background image');
        }
        const parsed = await res.json();
        data.loginBgUrl = parsed.url;
      }

      const resAction = await updateSettings(data);
      if (!resAction.success) throw new Error(resAction.error || 'Database save failed');
      
      alert('Settings Saved!');
      router.refresh();
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Unknown error occurred while saving.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgFileObject(file);
    setBgFilePreview(URL.createObjectURL(file));
  };

  const wipeData = async () => {
    if (!confirm('EXTREME DANGER: This will permanently erase ALL Order and Analytics history from the database! Are you absolutely sure?')) return;
    if (!confirm('Are you REALLY sure? This cannot be undone.')) return;
    
    const pwd = prompt('Enter admin password to proceed:');
    if (pwd !== 'Jitt7rry') {
      alert('Incorrect password. Action cancelled.');
      return;
    }

    setIsWiping(true);
    const res = await fetch('/api/admin/wipe', { method: 'POST' });
    setIsWiping(false);
    if (res.ok) {
      alert('All analytics and orders have been successfully wiped.');
      window.location.href = '/admin';
    } else {
      alert('Failed to erase data.');
    }
  };

  const handleUpdateCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) return alert("Enter your current password to authorize this action.");

    setIsUpdatingCreds(true);
    const res = await fetch('/api/admin/update-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newUsername: credUsername, newPassword: credPassword })
    });
    setIsUpdatingCreds(false);

    if (res.ok) {
      alert('Admin credentials successfully updated! You will be automatically signed out to re-login.');
      window.location.href = '/api/auth/signout';
    } else {
      alert('Failed: Incorrect current password or unauthorized.');
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* General Configuration */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">
          Brand & Payments Configuration
        </h2>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Restaurant / Hotel Name
            </label>
            <input
              type="text"
              value={hotelName}
              onChange={e => setHotelName(e.target.value)}
              className="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-bold"
              placeholder="e.g. LUXE DINING"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Admin Master UPI ID (For Direct Table Payments)
            </label>
            <input
              type="text"
              value={adminUpiId}
              onChange={e => setAdminUpiId(e.target.value)}
              className="w-full px-5 py-4 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-bold"
              placeholder="e.g. john.doe@okicici"
            />
            <p className="text-sm font-medium text-slate-500 mt-2">
              This completely controls the automatic QR codes generated on the Billing page. Ensure this is correct.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Login Screen Background
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBgUpload}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl w-full p-2"
            />
            <p className="text-xs text-slate-500 mt-2 font-medium">Select a local image from your device to display behind the login portal window.</p>
            {bgFilePreview && <img src={bgFilePreview} alt="Preview" className="h-24 mt-4 rounded-xl shadow-lg border border-slate-200 object-cover" />}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-4 bg-primary text-white font-black text-lg rounded-xl shadow-lg shadow-primary/30 flex items-center gap-2 transition hover:scale-[1.02] disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving Parameters...' : 'Save Configuration'}
          </button>
        </form>
      </div>

      {/* Security Module */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-xl">
        <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-500" /> Admin Identity & Password
        </h2>
        <form onSubmit={handleUpdateCreds} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">New Username</label>
              <input required value={credUsername} onChange={e => setCredUsername(e.target.value)} className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent font-bold" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <input required type="password" placeholder="At least 6 chars" value={credPassword} onChange={e => setCredPassword(e.target.value)} className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent font-bold" />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <label className="block text-xs font-black uppercase text-amber-600 mb-2">Current Admin Password to Authorize</label>
            <div className="flex gap-4">
              <input required type="password" placeholder="Verify it's you" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="flex-1 p-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/10 focus:ring-amber-500 focus:border-amber-500 font-bold" />
              <button disabled={isUpdatingCreds} type="submit" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 rounded-lg font-bold">Update Keys</button>
            </div>
          </div>
        </form>
      </div>

      {/* Extreme Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-[2rem] border border-red-200 dark:border-red-900 align-center">
        <h2 className="text-xl font-bold mb-2 text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Factory Data Wipe
        </h2>
        <p className="text-red-500 font-medium mb-6 text-sm">
          This action will permanently cascade-delete all processed Orders, live unfulfilled orders, and Analytics revenue records across the entire business. Menu Categories and Dishes will <strong>NOT</strong> be affected.
        </p>
        <button
          onClick={wipeData}
          disabled={isWiping}
          className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 hover:bg-red-700 disabled:opacity-50"
        >
          {isWiping ? 'Wiping Database...' : 'Erase All System Data'}
        </button>
      </div>
    </div>
  );
}
