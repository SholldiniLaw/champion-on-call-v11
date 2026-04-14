export const dynamic = 'force-dynamic';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { FileText, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { statusLabel, statusColor, formatCurrency } from '@/lib/utils';

export default async function PolicyholderDashboard() {
  const user = await requireRole('POLICYHOLDER');
  const profile = user.policyholderProfile;
  if (!profile) return <div className="p-8 text-center text-navy-400">Profile not found</div>;

  const claims = await prisma.claim.findMany({
    where: { policyholderId: profile.id },
    include: { assignedContractor: { include: { user: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const active = claims.filter((c) => c.status !== 'CLOSED');

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-sm text-navy-400 mt-1">Manage your claims and find contractors</p>
        </div>
        <Link href="/policyholder/report" className="btn-primary gap-2"><Plus className="w-4 h-4" /> Report New Claim</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Claims', value: claims.length },
          { label: 'Active', value: active.length },
          { label: 'Closed', value: claims.length - active.length },
          { label: 'Total Payout', value: formatCurrency(claims.reduce((s, c) => s + Number(c.calculatedPayout || 0), 0)) },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-navy mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-navy mb-4">Your Claims</h2>
      {claims.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-10 h-10 text-navy-200 mx-auto mb-3" />
          <p className="text-navy-400 font-medium">No claims yet</p>
          <Link href="/policyholder/report" className="btn-primary mt-4 gap-2"><Plus className="w-4 h-4" /> Report Claim</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <Link key={claim.id} href={claim.status === 'BLASTING' ? `/policyholder/marketplace/${claim.id}` : `/policyholder/claims/${claim.id}`}
              className="card flex flex-col sm:flex-row sm:items-center gap-3 group cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(claim.status)}`}>{statusLabel(claim.status)}</span>
                  <span className="text-xs text-navy-300">{claim.perilType}</span>
                </div>
                <p className="font-medium text-navy text-sm truncate">{claim.addressLine1}, {claim.city}</p>
                <p className="text-xs text-navy-400 mt-0.5 truncate">{claim.description}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-navy-400 shrink-0">
                {claim.assignedContractor && <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{claim.assignedContractor.user.name}</span>}
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDistanceToNow(claim.createdAt, { addSuffix: true })}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
