export const dynamic = 'force-dynamic';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { VettingClient } from './vetting-client';

export default async function AdminVettingPage() {
  await requireRole('ADMIN');
  const pending = await prisma.pendingContractor.findMany({
    include: { submittedBy: { include: { user: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const data = pending.map((p) => ({
    id: p.id,
    name: p.name,
    companyName: p.companyName,
    email: p.email,
    phone: p.phone,
    tradeType: p.tradeType,
    coverageAreaText: p.coverageAreaText,
    tosSignature: p.tosSignature,
    tosStatus: p.tosStatus,
    submittedBy: p.submittedBy?.user.name || null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">Vetting Queue</h1>
        <p className="text-sm text-navy-400 mt-1">{data.length} pending contractors</p>
      </div>
      <VettingClient pending={data} />
    </div>
  );
}
