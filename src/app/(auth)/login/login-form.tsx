'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Home, Wrench, Crown } from 'lucide-react';
import { toast } from 'sonner';

type UserData = { id: string; name: string; email: string; role: string; contractorProfile?: { companyName: string; tradeType: string } | null };

export function LoginForm({ admins, policyholders, contractors }: { admins: UserData[]; policyholders: UserData[]; contractors: UserData[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleLogin() {
    if (!selected) return;
    startTransition(async () => {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: selected }) });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Welcome, ${data.name}`);
        router.push(data.redirect);
        router.refresh();
      } else { toast.error('Login failed'); }
    });
  }

  const sections = [
    { title: 'Executive', icon: Crown, users: admins, color: 'border-violet-400 bg-violet-500/10', badge: 'bg-violet-100 text-violet-700' },
    { title: 'Policyholder', icon: Home, users: policyholders, color: 'border-blue-400 bg-blue-500/10', badge: 'bg-blue-100 text-blue-700' },
    { title: 'Contractor', icon: Wrench, users: contractors, color: 'border-emerald-400 bg-emerald-500/10', badge: 'bg-emerald-100 text-emerald-700' },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <div className="flex items-center gap-2 mb-3"><section.icon className="w-4 h-4 text-white/60" /><span className="text-sm font-medium text-white/60">{section.title}</span></div>
          <div className="grid gap-2">
            {section.users.map((user) => (
              <button key={user.id} onClick={() => setSelected(user.id)}
                className={`w-full text-left rounded-xl p-4 border-2 transition-all ${selected === user.id ? `${section.color} border-opacity-100` : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}>
                <div className="flex items-center justify-between">
                  <div><p className="font-semibold text-white text-sm">{user.name}</p><p className="text-xs text-white/40 mt-0.5">{user.email}</p></div>
                  {user.contractorProfile && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${section.badge}`}>{user.contractorProfile.tradeType}</span>}
                  {selected === user.id && <ShieldCheck className="w-5 h-5 text-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleLogin} disabled={!selected || isPending} className="btn-primary w-full py-3.5 text-base mt-4">
        {isPending ? 'Signing in...' : 'Enter Demo'}
      </button>
    </div>
  );
}
