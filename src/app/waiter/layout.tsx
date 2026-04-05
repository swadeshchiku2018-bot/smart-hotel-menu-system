import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { ClipboardList, PlusCircle, LogOut } from 'lucide-react';

export default async function WaiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !['ADMIN', 'WAITER'].includes((session.user as any).role)) {
    redirect('/auth/login');
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
      {/* Mobile Top Navbar for Waiter */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="font-bold text-lg text-primary">Waiter POS</h1>
          <p className="text-xs text-slate-500 font-medium">Floor Operations Dashboard</p>
        </div>
        <div className="flex gap-4">
           <Link href="/waiter" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 flex items-center justify-center shadow-sm">
              <ClipboardList className="w-5 h-5" />
           </Link>
           <Link href="/waiter/create-order" className="p-2 bg-primary text-white rounded-lg shrink-0 flex items-center justify-center shadow-sm shadow-primary/20">
              <PlusCircle className="w-5 h-5" />
           </Link>
           <Link href="/api/auth/signout" className="p-2 bg-red-100 dark:bg-red-950/40 text-red-500 rounded-lg shrink-0 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
           </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
