import Link from 'next/link';
import { LayoutDashboard, UtensilsCrossed, QrCode, ClipboardList, Settings, BarChart3, Banknote, Users, LogOut } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayoutClient from './AdminLayoutClient';

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
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}
