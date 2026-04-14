export const dynamic = 'force-dynamic';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { AdminCharts } from './admin-charts';

export default async function AdminDashboard() {
  const user = await requireRole('ADMIN');

  const [claims, contractors, pending, dispatches] = await Promise.all([
    prisma.claim.findMany({ include: { assignedContractor: { include: { user: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.contractorProfile.findMany({ include: { user: true }, orderBy: { championScore: 'desc' } }),
    prisma.pendingContractor.findMany(),
    prisma.dispatchLog.findMany({ where: { outcome: 'ACCEPTED' } }),
  ]);

  const totalPayout = claims.reduce((s, c) => s + Number(c.calculatedPayout || 0), 0);
  const avgScore = contractors.length ? contractors.reduce((s, c) => s + Number(c.championScore), 0) / contractors.length : 0;
  const flagged = contractors.filter((c) => c.isFlagged);
  const blasting = claims.filter((c) => c.status === 'BLASTING');
  const closed = claims.filter((c) => c.status === 'CLOSED');

  const statusCounts = claims.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const chartData = Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace('_', ' '), value }));

  const topContractors = contractors.slice(0, 5).map((c) => ({
    name: c.companyName,
    score: Number(c.championScore),
    trade: c.tradeType,
    vetted: c.isVetted,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">Control Tower</h1>
        <p className="text-sm text-navy-400 mt-1">Welcome, {user.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Claims', value: claims.length, color: 'text-navy' },
          { label: 'Active Blasts', value: blasting.length, color: 'text-crimson' },
          { label: 'Total Payouts', value: formatCurrency(totalPayout), color: 'text-navy' },
          { label: 'Avg Champion Score', value: avgScore.toFixed(2), color: 'text-navy' },
          { label: 'Network Contractors', value: contractors.filter((c) => c.isVetted).length, color: 'text-emerald-600' },
          { label: 'Flagged', value: flagged.length, color: 'text-crimson' },
          { label: 'Pending Vetting', value: pending.length, color: 'text-amber-600' },
          { label: 'Claims Closed', value: closed.length, color: 'text-navy' },
        ].map((s) => (
          <div key={s.label} className="card">
            <p className="text-xs font-medium text-navy-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <AdminCharts chartData={chartData} topContractors={topContractors} />
    </div>
  );
}
