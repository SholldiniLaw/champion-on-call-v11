import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getDemoUser } from '@/lib/auth';
export async function GET() {
  try {
    const user = await getDemoUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const contractors = await prisma.contractorProfile.findMany({ include: { user: true }, orderBy: { championScore: 'desc' } });
    return NextResponse.json(contractors);
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Internal error' }, { status: 500 }); }
}
