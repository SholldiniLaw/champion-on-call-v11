import { prisma } from '@/lib/db';
import { Shield } from 'lucide-react';
import { LoginForm } from './login-form';

export default async function LoginPage() {
  const users = await prisma.user.findMany({
    include: { contractorProfile: true, policyholderProfile: true },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  });

  const admins = users.filter((u) => u.role === 'ADMIN');
  const policyholders = users.filter((u) => u.role === 'POLICYHOLDER');
  const contractors = users.filter((u) => u.role === 'CONTRACTOR');

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-600 to-navy-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10"><Shield className="w-6 h-6 text-white" /></div>
            <span className="text-2xl font-bold text-white tracking-tight">Champion<span className="text-crimson-300">On-Call</span></span>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Product Demo</h1>
          <p className="text-white/50 text-sm">Select a persona to explore the platform</p>
        </div>
        <LoginForm admins={admins} policyholders={policyholders} contractors={contractors} />
      </div>
    </div>
  );
}
