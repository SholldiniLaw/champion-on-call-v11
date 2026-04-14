import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { statusLabel, statusColor, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { MapPin, Clock, User, Star, Shield } from 'lucide-react';
import Link from 'next/link';

export default async function ClaimDetailPage({ params }: { params: { id: string } }) {
  await requireRole('POLICYHOLDER');
  const { id } = params;

  const claim = await prisma.claim.findUnique({
    where: { id },
    include: { assignedContractor: { include: { user: true } }, policyholder: { include: { user: true } } },
  });

  if (!claim) return <div className="p-8 text-center text-navy-400">Claim not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/policyholder/dashboard" className="text-sm text-navy-400 hover:text-navy mb-2 inline-block">← Back to Dashboard</Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-navy tracking-tight">Claim Details</h1>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor(claim.status)}`}>{statusLabel(claim.status)}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card">
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">Property</h2>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-navy-300 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-navy">{claim.addressLine1}</p>
              <p className="text-sm text-navy-400">{claim.city}, {claim.state} {claim.zip}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">Loss Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-navy-400 text-xs">Peril Type</span><p className="font-medium text-navy">{claim.perilType}</p></div>
            <div><span className="text-navy-400 text-xs">Reported</span><p className="font-medium text-navy">{format(claim.createdAt, 'MMM d, yyyy')}</p></div>
          </div>
          <p className="text-sm text-navy-500 mt-3">{claim.description}</p>
          {claim.photoUrls.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {claim.photoUrls.map((url, i) => <img key={i} src={url} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0 border border-navy-100" />)}
            </div>
          )}
        </div>

        {claim.assignedContractor && (
          <div className="card">
            <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">Assigned Contractor</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center">
                <User className="w-6 h-6 text-navy-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-navy">{claim.assignedContractor.companyName}</p>
                  {claim.assignedContractor.isVetted && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Shield className="w-3 h-3" /> Network
                    </span>
                  )}
                </div>
                <p className="text-sm text-navy-400">{claim.assignedContractor.user.name}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-navy">{Number(claim.assignedContractor.championScore).toFixed(2)}</span>
              </div>
            </div>
            {claim.assignedAt && <p className="text-xs text-navy-400 mt-3 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Assigned {format(claim.assignedAt, 'MMM d, yyyy h:mm a')}</p>}
          </div>
        )}

        <div className="card">
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">Financials</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-navy-400">Xactimate Estimate</span>
              <span className="font-medium text-navy">{formatCurrency(Number(claim.xactimateUnitPriceTotal || 0))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-navy-400">Benefit Status</span>
              <span className={`font-semibold ${claim.benefitStatus === 'NETWORK_100' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {claim.benefitStatus === 'NETWORK_100' ? '100% Network' : '80% Cash'}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-navy-100 pt-2 mt-2">
              <span className="font-semibold text-navy">Your Payout</span>
              <span className="font-bold text-navy text-lg">{formatCurrency(Number(claim.calculatedPayout || 0))}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="card">
          <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">Timeline</h2>
          <div className="space-y-3">
            {[
              { label: 'Reported', date: claim.createdAt, active: true },
              { label: 'Contractor Assigned', date: claim.assignedAt, active: !!claim.assignedAt },
              { label: 'On-Site Check-In', date: claim.status === 'CHECKED_IN' ? new Date() : null, active: ['CHECKED_IN','INSPECTION_COMPLETE','CLOSED'].includes(claim.status) },
              { label: 'Inspection Complete', date: claim.inspectionCompletedAt, active: !!claim.inspectionCompletedAt },
              { label: 'Closed', date: claim.closedAt, active: !!claim.closedAt },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full shrink-0 ${step.active ? 'bg-emerald-500' : 'bg-navy-200'}`} />
                <span className={`text-sm ${step.active ? 'font-medium text-navy' : 'text-navy-300'}`}>{step.label}</span>
                {step.date && <span className="text-xs text-navy-400 ml-auto">{format(step.date, 'MMM d, h:mm a')}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
