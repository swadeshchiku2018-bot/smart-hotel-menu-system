import Link from 'next/link';
import { LayoutDashboard, UtensilsCrossed, QrCode, ClipboardList, Settings, BarChart3, Banknote, Users, LogOut } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/auth/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-primary">Master Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-2 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <ClipboardList className="w-5 h-5" />
            Live Orders
          </Link>
          <Link href="/admin/menu" className="flex items-center gap-3 px-4 py-2 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <UtensilsCrossed className="w-5 h-5" />
            Menu Dishes
          </Link>
          <Link href="/admin/tables" className="flex items-center gap-3 px-4 py-2 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <QrCode className="w-5 h-5" />
            Tables & QR
          </Link>
          <Link href="/admin/analytics" className="flex items-center gap-3 px-4 py-2 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <BarChart3 className="w-5 h-5" />
            Analytics
          </Link>
          <Link href="/admin/billing" className="flex items-center gap-3 px-4 py-2 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <Banknote className="w-5 h-5" />
            Billing & Payment
          </Link>
          <Link href="/admin/accounts" className="flex items-center gap-3 px-4 py-2 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <Users className="w-5 h-5" />
            Waiters
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-2 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          
          <div className="pt-8 mb-2">
            <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-2 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition">
              <LogOut className="w-5 h-5" />
              Sign Out
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 p-8">
        {children}
      </main>
    </div>
  );
}
