import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { statusLabel, statusColor, formatCurrency } from '@/lib/utils';
import { Star, Zap, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function ContractorDashboard() {
  const user = await requireRole('CONTRACTOR');
  const profile = user.contractorProfile;
  if (!profile) return <div className="p-8 text-center text-navy-400">Profile not found</div>;

  const dispatches = await prisma.dispatchLog.findMany({
    where: { contractorId: profile.id },
    include: { claim: true },
    orderBy: { createdAt: 'desc' },
  });

  const pendingBlasts = dispatches.filter((d) => d.outcome === 'PENDING' && d.claim.status === 'BLASTING');
  const accepted = dispatches.filter((d) => d.outcome === 'ACCEPTED');
  const assignedClaims = await prisma.claim.findMany({ where: { assignedContractorId: profile.id }, orderBy: { assignedAt: 'desc' } });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">Field Hub</h1>
        <p className="text-sm text-navy-400 mt-1">{profile.companyName} — {profile.tradeType}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-2 mb-1"><Star className="w-4 h-4 text-amber-400" /><span className="text-xs font-medium text-navy-400 uppercase">Champion Score</span></div>
          <p className="text-2xl font-bold text-navy">{Number(profile.championScore).toFixed(2)}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-1"><Zap className="w-4 h-4 text-amber-500" /><span className="text-xs font-medium text-navy-400 uppercase">Active Blasts</span></div>
          <p className="text-2xl font-bold text-crimson">{pendingBlasts.length}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-xs font-medium text-navy-400 uppercase">Claims Won</span></div>
          <p className="text-2xl font-bold text-navy">{accepted.length}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-blue-500" /><span className="text-xs font-medium text-navy-400 uppercase">Active Jobs</span></div>
          <p className="text-2xl font-bold text-navy">{assignedClaims.filter((c) => !['CLOSED'].includes(c.status)).length}</p>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="card mb-8">
        <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">Rating Breakdown</h2>
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Communication', val: Number(profile.communicationRating), weight: '15%' },
            { label: 'Professionalism', val: Number(profile.professionalismRating), weight: '20%' },
            { label: 'Punctuality', val: Number(profile.punctualityRating), weight: '20%' },
            { label: 'Cleanliness', val: Number(profile.cleanlinessRating), weight: '15%' },
            { label: 'Quality', val: Number(profile.qualityRating), weight: '30%' },
          ].map((r) => (
            <div key={r.label} className="text-center">
              <div className="text-2xl font-bold text-navy">{r.val.toFixed(1)}</div>
              <div className="text-xs text-navy-400 mt-0.5">{r.label}</div>
              <div className="text-[10px] text-navy-300">{r.weight}</div>
            </div>
          ))}
        </div>
      </div>

      {pendingBlasts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-crimson animate-pulse" />
            <h2 className="text-lg font-semibold text-navy">Live Claim Blasts</h2>
          </div>
          <div className="space-y-3">
            {pendingBlasts.map((d) => (
              <Link key={d.id} href={`/contractor/claims/${d.claim.id}`} className="card flex items-center gap-4 border-l-4 border-l-crimson cursor-pointer">
                <div className="flex-1">
                  <p className="font-medium text-navy text-sm">{d.claim.addressLine1}, {d.claim.city}</p>
                  <p className="text-xs text-navy-400">{d.claim.perilType} · {formatCurrency(Number(d.claim.xactimateUnitPriceTotal || 0))}</p>
                </div>
                <span className="btn-primary text-xs py-1.5 px-4">Grab →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {assignedClaims.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-navy mb-4">My Active Claims</h2>
          <div className="space-y-3">
            {assignedClaims.map((c) => (
              <Link key={c.id} href={`/contractor/claims/${c.id}`} className="card flex items-center gap-4 cursor-pointer">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(c.status)}`}>{statusLabel(c.status)}</span>
                  </div>
                  <p className="font-medium text-navy text-sm">{c.addressLine1}, {c.city}</p>
                  <p className="text-xs text-navy-400">{c.perilType}</p>
                </div>
                <span className="text-sm font-semibold text-navy">{formatCurrency(Number(c.xactimateUnitPriceTotal || 0))}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
