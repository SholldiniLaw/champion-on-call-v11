'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, X, FileText, User, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

type PendingItem = {
  id: string; name: string; companyName: string; email: string; phone: string | null;
  tradeType: string; coverageAreaText: string | null; tosSignature: string | null;
  tosStatus: string; submittedBy: string | null; createdAt: string;
};

export function VettingClient({ pending }: { pending: PendingItem[] }) {
  const [items, setItems] = useState(pending);
  const [processing, setProcessing] = useState<string | null>(null);
  const router = useRouter();

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/vetting/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast.success(action === 'approve' ? 'Contractor approved and added to network!' : 'Contractor rejected');
        setItems((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      } else {
        const e = await res.json();
        toast.error(e.error || 'Action failed');
      }
    } catch { toast.error('Network error'); }
    finally { setProcessing(null); }
  }

  if (items.length === 0) return (
    <div className="card text-center py-12">
      <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
      <p className="text-navy-400 font-medium">Vetting queue is clear</p>
      <p className="text-xs text-navy-300 mt-1">All pending contractors have been reviewed</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {items.map((p) => (
        <div key={p.id} className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-navy">{p.companyName}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  p.tosStatus === 'SIGNED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>{p.tosStatus}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-navy-50 text-navy border border-navy-200">{p.tradeType}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-navy-500">
                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-navy-300" />{p.name}</span>
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-navy-300" />{p.email}</span>
                {p.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-navy-300" />{p.phone}</span>}
                {p.coverageAreaText && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-navy-300" />{p.coverageAreaText}</span>}
              </div>
              {p.tosSignature && (
                <div className="mt-3 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-xs text-emerald-600 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> TOS Signature: {p.tosSignature}</span>
                </div>
              )}
              {p.submittedBy && <p className="text-xs text-navy-400 mt-2">Suggested by: {p.submittedBy}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleAction(p.id, 'approve')} disabled={processing === p.id}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => handleAction(p.id, 'reject')} disabled={processing === p.id}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-crimson-200 text-crimson text-sm font-semibold hover:bg-crimson-50 transition-colors disabled:opacity-50">
                <X className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
