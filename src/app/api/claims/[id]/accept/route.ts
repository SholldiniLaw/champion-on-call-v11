import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getDemoUser } from '@/lib/auth';
import { calculatePayout } from '@/lib/payout';
export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getDemoUser();
    if (!user || user.role !== 'CONTRACTOR') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const cp = user.contractorProfile;
    if (!cp) return NextResponse.json({ error: 'No profile' }, { status: 400 });
    const claimId = params.id;
    const result = await prisma.$transaction(async (tx) => {
      const claim = await tx.claim.findUnique({ where: { id: claimId } });
      if (!claim) throw new Error('NOT_FOUND');
      if (claim.status !== 'BLASTING') throw new Error('NOT_BLASTING');
      if (claim.assignedContractorId) throw new Error('ALREADY_TAKEN');
      const updated = await tx.claim.update({ where: { id: claimId }, data: { status: 'ASSIGNED', assignedContractorId: cp.id, assignedAt: new Date(), benefitStatus: cp.isVetted ? 'NETWORK_100' : 'CASH_80' } });
      await tx.dispatchLog.updateMany({ where: { claimId, contractorId: cp.id }, data: { acceptedAt: new Date(), outcome: 'ACCEPTED' } });
      await tx.dispatchLog.updateMany({ where: { claimId, contractorId: { not: cp.id }, outcome: 'PENDING' }, data: { outcome: 'EXPIRED' } });
      return updated;
    });
    await calculatePayout(claimId);
    return NextResponse.json({ id: result.id, status: result.status, assignedAt: result.assignedAt, message: 'Claim accepted' });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'NOT_FOUND') return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    if (msg === 'NOT_BLASTING' || msg === 'ALREADY_TAKEN') return NextResponse.json({ error: 'Another contractor has already accepted this claim' }, { status: 409 });
    console.error(e); return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
