import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AnalyticsCharts } from './analytics-charts';

export default async function AnalyticsPage() {
  await requireRole('ADMIN');

  const claims = await prisma.claim.findMany({ include: { assignedContractor: true }, orderBy: { createdAt: 'asc' } });
  const contractors = await prisma.contractorProfile.findMany({ include: { user: true, _count: { select: { assignedClaims: true } } }, orderBy: { championScore: 'desc' } });

  // Response time data (time from creation to assignment)
  const responseData = claims.filter(c => c.assignedAt).map(c => {
    const mins = Math.round((new Date(c.assignedAt!).getTime() - new Date(c.createdAt).getTime()) / 60000);
    return { claim: c.addressLine1.slice(0, 15), minutes: mins, peril: c.perilType };
  });

  // Peril distribution
  const perilCounts = claims.reduce((acc, c) => { acc[c.perilType] = (acc[c.perilType] || 0) + 1; return acc; }, {} as Record<string, number>);
  const perilData = Object.entries(perilCounts).map(([name, value]) => ({ name, value }));

  // Benefit distribution
  const networkClaims = claims.filter(c => c.benefitStatus === 'NETWORK_100').length;
  const cashClaims = claims.filter(c => c.benefitStatus === 'CASH_80').length;
  const benefitData = [{ name: 'Network 100%', value: networkClaims }, { name: 'Cash 80%', value: cashClaims }];

  // Contractor performance
  const contractorData = contractors.slice(0, 8).map(c => ({
    name: c.companyName.split(' ')[0],
    score: Number(c.championScore),
    claims: c._count.assignedClaims,
  }));

  // Monthly claims (simulate from seed data)
  const monthlyData = [
    { month: 'Oct', claims: 2, payout: 86500 },
    { month: 'Nov', claims: 1, payout: 42500 },
    { month: 'Dec', claims: 0, payout: 0 },
    { month: 'Jan', claims: 2, payout: 31550 },
    { month: 'Feb', claims: 1, payout: 12800 },
    { month: 'Mar', claims: 3, payout: 91700 },
    { month: 'Apr', claims: 2, payout: 60500 },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">Analytics</h1>
        <p className="text-sm text-navy-400 mt-1">Operations insights and performance metrics</p>
      </div>
      <AnalyticsCharts
        responseData={responseData}
        perilData={perilData}
        benefitData={benefitData}
        contractorData={contractorData}
        monthlyData={monthlyData}
      />
    </div>
  );
}
