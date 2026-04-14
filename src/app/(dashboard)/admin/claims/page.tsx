import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { statusLabel, statusColor, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

export default async function AdminClaimsPage() {
  await requireRole('ADMIN');
  const claims = await prisma.claim.findMany({
    include: { policyholder: { include: { user: true } }, assignedContractor: { include: { user: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">All Claims</h1>
        <p className="text-sm text-navy-400 mt-1">{claims.length} claims total</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-navy-400 uppercase">Address</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-navy-400 uppercase">Peril</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-navy-400 uppercase">Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-navy-400 uppercase">Contractor</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-navy-400 uppercase">Benefit</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-navy-400 uppercase">Payout</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-navy-400 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100/40">
            {claims.map((c) => (
              <tr key={c.id} className="hover:bg-navy-50/30 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-medium text-navy">{c.addressLine1}</p>
                  <p className="text-xs text-navy-400">{c.city}, {c.state}</p>
                </td>
                <td className="py-3 px-4 text-navy-500">{c.perilType}</td>
                <td className="py-3 px-4"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(c.status)}`}>{statusLabel(c.status)}</span></td>
                <td className="py-3 px-4 text-navy-500">{c.assignedContractor?.companyName || '—'}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-semibold ${c.benefitStatus === 'NETWORK_100' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {c.benefitStatus === 'NETWORK_100' ? '100%' : '80%'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-medium text-navy">{formatCurrency(Number(c.calculatedPayout || 0))}</td>
                <td className="py-3 px-4 text-right text-xs text-navy-400">{format(c.createdAt, 'MMM d, yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
