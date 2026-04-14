export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { claimReportSchema } from '@/lib/schemas';
import { getDemoUser } from '@/lib/auth';
export async function POST(req: NextRequest) {
  try {
    const user = await getDemoUser();
    if (!user || user.role !== 'POLICYHOLDER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const parsed = claimReportSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    const profileId = body.profileId || user.policyholderProfile?.id;
    if (!profileId) return NextResponse.json({ error: 'No profile' }, { status: 400 });
    const claim = await prisma.claim.create({
      data: { policyholderId: profileId, ...parsed.data, status: 'BLASTING', xactimateUnitPriceTotal: Math.floor(Math.random() * 40000) + 10000 },
    });
    const eligible = await prisma.contractorProfile.findMany({ where: { isVetted: true, isFlagged: false } });
    const blastId = `blast-${claim.id.slice(0, 8)}`;
    await prisma.dispatchLog.createMany({
      data: eligible.map((c) => ({ claimId: claim.id, blastId, contractorId: c.id, notifiedAt: new Date(), outcome: 'PENDING' as const })),
    });
    return NextResponse.json({ id: claim.id, status: claim.status }, { status: 201 });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Internal error' }, { status: 500 }); }
}
export async function GET() {
  try {
    const user = await getDemoUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    let claims;
    if (user.role === 'ADMIN') {
      claims = await prisma.claim.findMany({ include: { policyholder: { include: { user: true } }, assignedContractor: { include: { user: true } } }, orderBy: { createdAt: 'desc' } });
    } else if (user.role === 'CONTRACTOR') {
      const profile = user.contractorProfile;
      if (!profile) return NextResponse.json([]);
      const dispatches = await prisma.dispatchLog.findMany({ where: { contractorId: profile.id }, include: { claim: { include: { policyholder: { include: { user: true } }, assignedContractor: { include: { user: true } } } } }, orderBy: { createdAt: 'desc' } });
      claims = [...new Map(dispatches.map(d => [d.claim.id, d.claim])).values()];
    } else {
      claims = await prisma.claim.findMany({ where: { policyholderId: user.policyholderProfile?.id }, include: { assignedContractor: { include: { user: true } } }, orderBy: { createdAt: 'desc' } });
    }
    return NextResponse.json(claims);
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Internal error' }, { status: 500 }); }
}
