import HistoryClient from './HistoryClient';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Order History</h1>
        <p className="text-slate-500 mt-2">View past completed and cancelled orders by day.</p>
      </div>
      
      <HistoryClient />
    </div>
  );
}
