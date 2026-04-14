'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Home, FileText, Users, Menu, X, LogOut, ChevronRight, ClipboardList, UserPlus, ShieldCheck, PieChart, Wrench, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type NavItem = { label: string; href: string; icon: React.ElementType };
const NAV: Record<string, NavItem[]> = {
  POLICYHOLDER: [
    { label: 'Dashboard', href: '/policyholder/dashboard', icon: Home },
    { label: 'Report a Claim', href: '/policyholder/report', icon: FileText },
    { label: 'Suggest Contractor', href: '/policyholder/suggest-contractor', icon: UserPlus },
  ],
  CONTRACTOR: [
    { label: 'Dashboard', href: '/contractor/dashboard', icon: Home },
    { label: 'Claim Grab', href: '/contractor/claims', icon: ClipboardList },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { label: 'Claims', href: '/admin/claims', icon: FileText },
    { label: 'Contractors', href: '/admin/contractors', icon: Users },
    { label: 'Vetting Queue', href: '/admin/vetting', icon: ShieldCheck },
    { label: 'Analytics', href: '/admin/analytics', icon: PieChart },
  ],
};

export function DashboardShell({ children, userName, userRole }: { children: React.ReactNode; userName: string; userRole: string; userId: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const items = NAV[userRole] || [];
  const roleLabel = userRole === 'ADMIN' ? 'Executive' : userRole === 'CONTRACTOR' ? 'Contractor' : 'Policyholder';
  const roleColor = userRole === 'ADMIN' ? 'bg-violet-100 text-violet-700' : userRole === 'CONTRACTOR' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700';
  const RoleIcon = userRole === 'ADMIN' ? Crown : userRole === 'CONTRACTOR' ? Wrench : Home;

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' });
    toast.success('Signed out');
    router.push('/login');
    router.refresh();
  }

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center px-5 border-b border-navy-100/60">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
          <span className="font-bold text-navy tracking-tight">Champion<span className="text-crimson">On-Call</span></span>
        </Link>
      </div>
      <div className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColor}`}>{roleLabel} Portal</span></div>
      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors', active ? 'bg-navy text-white' : 'text-navy-500 hover:bg-navy-50')}>
              <item.icon className="w-5 h-5" />{item.label}{active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-navy-100/60">
        <div className="px-3 py-2"><p className="text-sm font-medium text-navy truncate">{userName}</p><p className="text-xs text-navy-400">{roleLabel}</p></div>
        <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-sm text-crimson font-medium hover:bg-crimson-50 rounded-lg w-full transition-colors"><LogOut className="w-4 h-4" /> Sign Out</button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-navy-100/60 h-14 flex items-center px-4 gap-3">
        <button onClick={() => setOpen(true)} className="p-1 -ml-1"><Menu className="w-6 h-6 text-navy" /></button>
        <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-navy" /><span className="font-bold text-navy text-sm">Champion<span className="text-crimson">On-Call</span></span></div>
        <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${roleColor}`}>{roleLabel}</span>
      </header>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-72 bg-white flex flex-col shadow-xl">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4"><X className="w-5 h-5 text-navy-400" /></button>
            <SidebarContent />
          </div>
        </div>
      )}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-60 bg-white border-r border-navy-100/60 flex-col z-30"><SidebarContent /></aside>
      <main className="lg:ml-60 pt-14 lg:pt-0 min-h-screen"><div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div></main>
    </div>
  );
}
