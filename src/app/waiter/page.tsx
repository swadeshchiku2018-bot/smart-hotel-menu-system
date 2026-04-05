import WaiterDashboardClient from './WaiterDashboardClient';
import { getOrders } from '@/actions/orders';
import { getSettings } from '@/actions/settings';

export const dynamic = 'force-dynamic';

export default async function WaiterDashboard() {
  const [orders, settings] = await Promise.all([
    getOrders(),
    getSettings(),
  ]);

  return <WaiterDashboardClient orders={orders} settings={settings} />;
}
