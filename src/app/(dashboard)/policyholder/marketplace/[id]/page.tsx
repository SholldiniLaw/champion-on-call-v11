export const dynamic = 'force-dynamic'; 
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { MarketplaceClient } from './marketplace-client';

export default async function MarketplacePage({ params }: { params: { id: string } }) {
  const user = await requireRole('POLICYHOLDER');
  const { id } = params;

  const claim = await prisma.claim.findUnique({ where: { id } });
  if (!claim) return <div className="p-8 text-center text-navy-400">Claim not found</div>;

  const contractors = await prisma.contractorProfile.findMany({
    where: { isFlagged: false },
    include: { user: true },
    orderBy: { championScore: 'desc' },
  });

  const data = contractors.map((c) => ({
    id: c.id,
    name: c.user.name,
    companyName: c.companyName,
    tradeType: c.tradeType,
    isVetted: c.isVetted,
    championScore: Number(c.championScore),
    communicationRating: Number(c.communicationRating),
    professionalismRating: Number(c.professionalismRating),
    punctualityRating: Number(c.punctualityRating),
    cleanlinessRating: Number(c.cleanlinessRating),
    qualityRating: Number(c.qualityRating),
    latitude: Number(c.latitude),
    longitude: Number(c.longitude),
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">Provider Marketplace</h1>
        <p className="text-sm text-navy-400 mt-1">{claim.addressLine1}, {claim.city} — {claim.perilType}</p>
      </div>
      <MarketplaceClient
        claimId={claim.id}
        claimLat={Number(claim.latitude)}
        claimLng={Number(claim.longitude)}
        xactimateTotal={Number(claim.xactimateUnitPriceTotal || 0)}
        contractors={data}
      />
    </div>
  );
}
