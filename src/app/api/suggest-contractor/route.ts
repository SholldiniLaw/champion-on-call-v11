import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { suggestContractorSchema } from '@/lib/schemas';
import { getDemoUser } from '@/lib/auth';
export async function POST(req: NextRequest) {
  try {
    const user = await getDemoUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const parsed = suggestContractorSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    const pc = await prisma.pendingContractor.create({
      data: { ...parsed.data, tosStatus: 'SENT', submittedByPolicyholderId: user.policyholderProfile?.id },
    });
    return NextResponse.json({ id: pc.id, message: 'Contractor suggestion submitted' }, { status: 201 });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Internal error' }, { status: 500 }); }
}
