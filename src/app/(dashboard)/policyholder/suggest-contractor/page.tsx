export const dynamic = 'force-dynamic';
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SuggestContractorPage() {
  const [form, setForm] = useState({ name: '', companyName: '', email: '', phone: '', tradeType: 'WATER', coverageAreaText: '' });
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const upd = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  function submit() {
    if (!form.name || !form.companyName || !form.email) return toast.error('Fill required fields');
    startTransition(async () => {
      const res = await fetch('/api/suggest-contractor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { setSubmitted(true); toast.success('Contractor suggestion submitted!'); }
      else { const e = await res.json(); toast.error(typeof e.error === 'string' ? e.error : 'Failed'); }
    });
  }

  if (submitted) return (
    <div className="max-w-lg mx-auto text-center py-16">
      <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-navy mb-2">Suggestion Submitted!</h2>
      <p className="text-navy-400 mb-6">Our team will review this contractor and begin the onboarding process.</p>
      <button onClick={() => router.push('/policyholder/dashboard')} className="btn-secondary">Back to Dashboard</button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">Suggest a Contractor</h1>
        <p className="text-sm text-navy-400 mt-1">Know a great contractor? Suggest them for our network.</p>
      </div>
      <div className="card p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center"><UserPlus className="w-5 h-5 text-navy" /></div>
          <div><h2 className="font-semibold text-navy text-sm">Contractor Information</h2><p className="text-xs text-navy-400">All suggested contractors go through our vetting process</p></div>
        </div>
        <div><label className="label">Contact Name *</label><input className="input" value={form.name} onChange={(e) => upd('name', e.target.value)} placeholder="Full name" /></div>
        <div><label className="label">Company Name *</label><input className="input" value={form.companyName} onChange={(e) => upd('companyName', e.target.value)} placeholder="Company name" /></div>
        <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={(e) => upd('email', e.target.value)} placeholder="email@example.com" /></div>
        <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => upd('phone', e.target.value)} placeholder="(305) 555-0000" /></div>
        <div>
          <label className="label">Trade Type *</label>
          <select className="input" value={form.tradeType} onChange={(e) => upd('tradeType', e.target.value)}>
            <option value="WATER">Water Mitigation</option><option value="ROOF">Roofing</option><option value="STRUCTURAL">Structural</option>
          </select>
        </div>
        <div><label className="label">Coverage Area</label><input className="input" value={form.coverageAreaText} onChange={(e) => upd('coverageAreaText', e.target.value)} placeholder="e.g., Miami-Dade, Broward" /></div>
        <button onClick={submit} disabled={isPending} className="btn-primary w-full gap-2">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}{isPending ? 'Submitting...' : 'Submit Suggestion'}
        </button>
      </div>
    </div>
  );
}

