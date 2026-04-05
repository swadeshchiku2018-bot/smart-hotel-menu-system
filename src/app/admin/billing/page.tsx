import BillingClient from './BillingClient';
import { getOrders } from '@/actions/orders';
import { getSettings } from '@/actions/settings';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const [orders, settings] = await Promise.all([
    getOrders(),
    getSettings()
  ]);
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">Billing & Payments</h1>
      <p className="text-slate-500 mb-8 max-w-2xl">
        Manage customer bills and accept payments instantly. Select a customer below to aggregate their unpaid orders and generate a UPI payment QR code.
      </p>
      <BillingClient 
        orders={orders} 
        hotelName={settings.hotelName} 
        adminUpiId={settings.adminUpiId} 
      />
    </div>
  );
}
