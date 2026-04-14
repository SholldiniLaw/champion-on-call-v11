import { getDemoUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await getDemoUser();
  } catch {
    redirect('/login');
  }
  if (!user) redirect('/login');
  return <DashboardShell userName={user.name} userRole={user.role} userId={user.id}>{children}</DashboardShell>;
}