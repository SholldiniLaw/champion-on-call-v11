import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Star, Shield, AlertTriangle } from 'lucide-react';

export default async function AdminContractorsPage() {
  await requireRole('ADMIN');
  const contractors = await prisma.contractorProfile.findMany({
    include: { user: true, _count: { select: { assignedClaims: true } } },
    orderBy: { championScore: 'desc' },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">Contractor Network</h1>
        <p className="text-sm text-navy-400 mt-1">{contractors.length} contractors · {contractors.filter(c => c.isVetted).length} vetted · {contractors.filter(c => c.isFlagged).length} flagged</p>
      </div>
      <div className="space-y-3">
        {contractors.map((c) => (
          <div key={c.id} className={`card flex flex-col sm:flex-row sm:items-center gap-4 ${c.isFlagged ? 'border-l-4 border-l-crimson' : ''}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-navy text-sm">{c.companyName}</h3>
                {c.isVetted && <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><Shield className="w-2.5 h-2.5" /> Network</span>}
                {c.isFlagged && <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-crimson-50 text-crimson border border-crimson-200"><AlertTriangle className="w-2.5 h-2.5" /> Flagged</span>}
              </div>
              <p className="text-xs text-navy-400">{c.user.name} · {c.tradeType} · {c._count.assignedClaims} claims</p>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { l: 'Comm', v: Number(c.communicationRating) },
                { l: 'Prof', v: Number(c.professionalismRating) },
                { l: 'Punct', v: Number(c.punctualityRating) },
                { l: 'Clean', v: Number(c.cleanlinessRating) },
                { l: 'Qual', v: Number(c.qualityRating) },
              ].map((r) => (
                <div key={r.l}><div className="text-xs font-bold text-navy">{r.v.toFixed(1)}</div><div className="text-[10px] text-navy-300">{r.l}</div></div>
              ))}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-lg font-bold text-navy">{Number(c.championScore).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
