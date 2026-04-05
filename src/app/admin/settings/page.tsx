import SettingsClient from './SettingsClient';
import { getSettings } from '@/actions/settings';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getSettings();
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">Settings</h1>
      <SettingsClient initialHotelName={settings.hotelName} initialUpiId={settings.adminUpiId} />
    </div>
  );
}
