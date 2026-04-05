import { getTables } from '@/actions/tables';
import TablesClient from './TablesClient';

export const dynamic = 'force-dynamic';

export default async function TablesPage() {
  const tables = await getTables();
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Tables & QR Codes</h1>
        <p className="text-slate-500 mt-2">Manage tables and download unique QR codes for each table.</p>
      </div>
      
      <TablesClient initialTables={tables} />
    </div>
  );
}
