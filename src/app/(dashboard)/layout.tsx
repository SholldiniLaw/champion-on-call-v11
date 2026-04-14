import { redirect } from 'next/navigation';
import { getDemoUser } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard-shell';
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getDemoUser();
  if (!user) redirect('/login');
  return <DashboardShell userName={user.name} userRole={user.role} userId={user.id}>{children}</DashboardShell>;
}
