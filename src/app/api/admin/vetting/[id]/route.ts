import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getDemoUser } from '@/lib/auth';
import { calculateChampionScore } from '@/lib/payout';
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getDemoUser();
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { action } = await req.json();
    const pc = await prisma.pendingContractor.findUnique({ where: { id: params.id } });
    if (!pc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (action === 'approve') {
      const newUser = await prisma.user.create({ data: { name: pc.name, email: pc.email, role: 'CONTRACTOR' } });
      const ratings = { communication: 3.0, professionalism: 3.0, punctuality: 3.0, cleanliness: 3.0, quality: 3.0 };
      const score = calculateChampionScore(ratings);
      await prisma.contractorProfile.create({
        data: { userId: newUser.id, companyName: pc.companyName, tradeType: pc.tradeType, latitude: 25.749, longitude: -80.259, isVetted: true, tosStatus: 'VETTED', championScore: score, communicationRating: ratings.communication, professionalismRating: ratings.professionalism, punctualityRating: ratings.punctuality, cleanlinessRating: ratings.cleanliness, qualityRating: ratings.quality },
      });
      await prisma.pendingContractor.update({ where: { id: params.id }, data: { tosStatus: 'VETTED', reviewedByAdminId: user.id } });
      return NextResponse.json({ message: 'Contractor approved and added to network' });
    } else if (action === 'reject') {
      await prisma.pendingContractor.delete({ where: { id: params.id } });
      return NextResponse.json({ message: 'Contractor rejected' });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Internal error' }, { status: 500 }); }
}
