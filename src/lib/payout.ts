import { prisma } from './db';
export const SCORE_WEIGHTS = { communication: 0.15, professionalism: 0.20, punctuality: 0.20, cleanliness: 0.15, quality: 0.30 } as const;
export function calculateChampionScore(r: { communication: number; professionalism: number; punctuality: number; cleanliness: number; quality: number }) {
  return Number((r.communication * 0.15 + r.professionalism * 0.20 + r.punctuality * 0.20 + r.cleanliness * 0.15 + r.quality * 0.30).toFixed(2));
}
export async function calculatePayout(claimId: string) {
  const claim = await prisma.claim.findUnique({ where: { id: claimId }, include: { assignedContractor: true } });
  if (!claim || !claim.xactimateUnitPriceTotal) return { xactimateTotal: 0, payout: 0, isNetwork: false, penaltyApplied: false };
  const xactimateTotal = Number(claim.xactimateUnitPriceTotal);
  const isNetwork = claim.assignedContractor?.isVetted ?? false;
  const payout = isNetwork ? xactimateTotal : xactimateTotal * 0.8;
  await prisma.claim.update({ where: { id: claimId }, data: { calculatedPayout: payout, benefitStatus: isNetwork ? 'NETWORK_100' : 'CASH_80' } });
  return { xactimateTotal, payout, isNetwork, penaltyApplied: !isNetwork };
}
export function payoutForDisplay(xactimateTotal: number, isNetwork: boolean) {
  const payout = isNetwork ? xactimateTotal : xactimateTotal * 0.8;
  return { payout, penaltyAmount: isNetwork ? 0 : xactimateTotal * 0.2, penaltyApplied: !isNetwork, percentage: isNetwork ? 100 : 80 };
}
