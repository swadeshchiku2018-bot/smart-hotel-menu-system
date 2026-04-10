'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, QrCode, ClipboardList, Settings, BarChart3, Banknote, Users, LogOut, Menu, X } from 'lucide-react';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Live Orders', icon: ClipboardList },
    { href: '/admin/menu', label: 'Menu Dishes', icon: UtensilsCrossed },
    { href: '/admin/tables', label: 'Tables & QR', icon: QrCode },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/billing', label: 'Billing & Payment', icon: Banknote },
    { href: '/admin/accounts', label: 'Waiters', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 relative">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 z-50">
        <h2 className="text-xl font-bold text-primary">Master Admin</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-800 dark:text-slate-200">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transform transition-transform duration-300 md:translate-x-0 md:static ${isMobileMenuOpen ? 'translate-x-0 pt-16 md:pt-0' : '-translate-x-full pt-16 md:pt-0'}`}>
        <div className="hidden md:flex p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-primary">Master Admin</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
          
          <div className="pt-8 mb-2 border-t border-slate-100 dark:border-slate-700 mt-6">
            <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-3 text-red-500 font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition">
              <LogOut className="w-5 h-5" />
              Sign Out
            </Link>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 md:p-8 pt-20 md:pt-8 w-full min-w-0">
        {children}
      </main>
    </div>
  );
}
