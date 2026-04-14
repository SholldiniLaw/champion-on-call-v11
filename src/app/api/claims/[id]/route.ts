export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getDemoUser } from '@/lib/auth';
import { checkInSchema } from '@/lib/schemas';
import { distanceMeters } from '@/lib/geo';
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getDemoUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const claim = await prisma.claim.findUnique({ where: { id: params.id }, include: { policyholder: { include: { user: true } }, assignedContractor: { include: { user: true } }, dispatchLogs: { include: { contractor: { include: { user: true } } }, orderBy: { createdAt: 'desc' } } } });
    if (!claim) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(claim);
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Internal error' }, { status: 500 }); }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getDemoUser();
    if (!user || user.role !== 'CONTRACTOR') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const parsed = checkInSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
    const claim = await prisma.claim.findUnique({ where: { id: params.id } });
    if (!claim) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (claim.status !== 'ASSIGNED') return NextResponse.json({ error: 'Must be ASSIGNED to check in' }, { status: 400 });
    if (claim.assignedContractorId !== user.contractorProfile?.id) return NextResponse.json({ error: 'Not your claim' }, { status: 403 });
    const dist = distanceMeters(parsed.data.latitude, parsed.data.longitude, Number(claim.latitude), Number(claim.longitude));
    if (dist > 100 && !parsed.data.demoBypass) return NextResponse.json({ error: `Too far (${Math.round(dist)}m). Must be within 100m.`, distance: Math.round(dist), required: 100 }, { status: 400 });
    const updated = await prisma.claim.update({ where: { id: params.id }, data: { status: 'CHECKED_IN' } });
    return NextResponse.json({ id: updated.id, status: updated.status, distance: Math.round(dist), message: parsed.data.demoBypass ? 'Checked in (demo bypass)' : `Checked in — ${Math.round(dist)}m from property` });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Internal error' }, { status: 500 }); }
}
