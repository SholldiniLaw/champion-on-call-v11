import { PrismaClient, Role, ContractorTradeType, TosStatus, ClaimStatus, DispatchOutcome } from '@prisma/client';

const prisma = new PrismaClient();

function score(c: number, p: number, pu: number, cl: number, q: number) {
  return Number((c * 0.15 + p * 0.20 + pu * 0.20 + cl * 0.15 + q * 0.30).toFixed(2));
}

async function main() {
  console.log('🏗️  Seeding Champion On-Call...');

  await prisma.dispatchLog.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.pendingContractor.deleteMany();
  await prisma.contractorProfile.deleteMany();
  await prisma.policyholderProfile.deleteMany();
  await prisma.user.deleteMany();

  // ── ADMINS ──
  const adminLockard = await prisma.user.create({ data: { name: 'David Lockard, Esq.', email: 'dlockard@championinsurance.com', role: Role.ADMIN } });
  const adminSholl = await prisma.user.create({ data: { name: 'David M. Sholl, Esq.', email: 'dsholl@championinsurance.com', role: Role.ADMIN } });
  const adminUdouj = await prisma.user.create({ data: { name: 'Paul Udouj, Esq.', email: 'pudouj@championinsurance.com', role: Role.ADMIN } });

  // ── POLICYHOLDERS ──
  const ph1 = await prisma.user.create({ data: { name: 'Maria Gonzalez', email: 'maria.gonzalez@demo.com', role: Role.POLICYHOLDER } });
  const ph2 = await prisma.user.create({ data: { name: 'James Rivera', email: 'james.rivera@demo.com', role: Role.POLICYHOLDER } });
  const phP1 = await prisma.policyholderProfile.create({ data: { userId: ph1.id, phone: '(305) 555-0142', defaultAddress: '1247 Alhambra Cir, Coral Gables, FL 33134' } });
  const phP2 = await prisma.policyholderProfile.create({ data: { userId: ph2.id, phone: '(305) 555-0287', defaultAddress: '8901 SW 72nd Ave, Miami, FL 33156' } });

  // ── CONTRACTORS ──
  const cData = [
    { name: 'Carlos Mendez', email: 'carlos@rapidresponsefl.com', co: 'Rapid Response Restoration', trade: ContractorTradeType.WATER, lat: 25.749, lng: -80.262, r: { c:4.8,p:4.9,pu:4.7,cl:4.6,q:4.9 }, v: true, f: false, tos: TosStatus.VETTED },
    { name: 'Roberto Silva', email: 'roberto@silvaroofing.com', co: 'Silva Roofing & Waterproofing', trade: ContractorTradeType.ROOF, lat: 25.733, lng: -80.258, r: { c:4.5,p:4.6,pu:4.8,cl:4.3,q:4.7 }, v: true, f: false, tos: TosStatus.VETTED },
    { name: 'Ana Torres', email: 'ana@torresstructural.com', co: 'Torres Structural Engineering', trade: ContractorTradeType.STRUCTURAL, lat: 25.761, lng: -80.251, r: { c:4.9,p:4.8,pu:4.5,cl:4.7,q:4.8 }, v: true, f: false, tos: TosStatus.VETTED },
    { name: 'Miguel Herrera', email: 'miguel@herrerawater.com', co: 'Herrera Water Mitigation', trade: ContractorTradeType.WATER, lat: 25.720, lng: -80.278, r: { c:4.2,p:4.4,pu:4.1,cl:4.0,q:4.3 }, v: true, f: false, tos: TosStatus.VETTED },
    { name: 'Patricia Vega', email: 'patricia@vegaroof.com', co: 'Vega Premier Roofing', trade: ContractorTradeType.ROOF, lat: 25.755, lng: -80.245, r: { c:4.7,p:4.5,pu:4.9,cl:4.8,q:4.6 }, v: true, f: false, tos: TosStatus.VETTED },
    { name: 'David Castellano', email: 'david@castellanorestoration.com', co: 'Castellano Restoration Group', trade: ContractorTradeType.WATER, lat: 25.768, lng: -80.234, r: { c:3.8,p:3.5,pu:3.9,cl:3.6,q:3.7 }, v: false, f: true, tos: TosStatus.SIGNED },
    { name: 'Sofia Reyes', email: 'sofia@reyesroofing.com', co: 'Reyes Roofing Solutions', trade: ContractorTradeType.ROOF, lat: 25.741, lng: -80.269, r: { c:4.0,p:4.1,pu:3.8,cl:4.2,q:4.0 }, v: false, f: false, tos: TosStatus.SIGNED },
    { name: 'Alejandro Diaz', email: 'alejandro@diazstructural.com', co: 'Diaz Structural Services', trade: ContractorTradeType.STRUCTURAL, lat: 25.752, lng: -80.256, r: { c:4.6,p:4.7,pu:4.4,cl:4.5,q:4.8 }, v: true, f: false, tos: TosStatus.VETTED },
    { name: 'Isabel Morales', email: 'isabel@moraleswater.com', co: 'Morales Emergency Water', trade: ContractorTradeType.WATER, lat: 25.735, lng: -80.270, r: { c:4.3,p:4.2,pu:4.6,cl:4.1,q:4.4 }, v: true, f: false, tos: TosStatus.VETTED },
    { name: 'Fernando Ruiz', email: 'fernando@ruizroofing.com', co: 'Ruiz All-Weather Roofing', trade: ContractorTradeType.ROOF, lat: 25.746, lng: -80.282, r: { c:3.5,p:3.8,pu:3.4,cl:3.2,q:3.6 }, v: false, f: true, tos: TosStatus.SENT },
  ];

  const cProfiles: { id: string }[] = [];
  for (const c of cData) {
    const u = await prisma.user.create({ data: { name: c.name, email: c.email, role: Role.CONTRACTOR } });
    const s = score(c.r.c, c.r.p, c.r.pu, c.r.cl, c.r.q);
    const p = await prisma.contractorProfile.create({
      data: { userId: u.id, companyName: c.co, tradeType: c.trade, latitude: c.lat, longitude: c.lng, radiusKm: 50, tosStatus: c.tos, isVetted: c.v, isFlagged: c.f, communicationRating: c.r.c, professionalismRating: c.r.p, punctualityRating: c.r.pu, cleanlinessRating: c.r.cl, qualityRating: c.r.q, championScore: s },
    });
    cProfiles.push({ id: p.id });
  }

  // ── CLAIMS ──
  const cl1 = await prisma.claim.create({ data: { policyholderId: phP1.id, addressLine1: '1247 Alhambra Cir', city: 'Coral Gables', state: 'FL', zip: '33134', latitude: 25.750, longitude: -80.259, perilType: 'Hurricane', description: 'Significant roof damage from Hurricane Milton. Multiple shingles displaced, water intrusion in master bedroom.', status: ClaimStatus.CLOSED, assignedContractorId: cProfiles[1].id, assignedAt: new Date('2024-10-15T09:30:00Z'), inspectionCompletedAt: new Date('2024-10-15T14:00:00Z'), closedAt: new Date('2024-11-20T16:00:00Z'), xactimateUnitPriceTotal: 42500, calculatedPayout: 42500, benefitStatus: 'NETWORK_100' } });

  const cl2 = await prisma.claim.create({ data: { policyholderId: phP2.id, addressLine1: '8901 SW 72nd Ave', city: 'Miami', state: 'FL', zip: '33156', latitude: 25.692, longitude: -80.278, perilType: 'Water Damage', description: 'Pipe burst under kitchen sink causing water damage to cabinets and flooring.', status: ClaimStatus.INSPECTION_COMPLETE, assignedContractorId: cProfiles[0].id, assignedAt: new Date('2025-01-08T11:00:00Z'), inspectionCompletedAt: new Date('2025-01-08T15:30:00Z'), xactimateUnitPriceTotal: 18750, calculatedPayout: 18750, benefitStatus: 'NETWORK_100' } });

  await prisma.claim.create({ data: { policyholderId: phP1.id, addressLine1: '2340 Segovia St', city: 'Coral Gables', state: 'FL', zip: '33134', latitude: 25.749, longitude: -80.263, perilType: 'Roof Damage', description: 'Concrete tile roof damaged during tropical storm. Several tiles cracked.', status: ClaimStatus.ASSIGNED, assignedContractorId: cProfiles[4].id, assignedAt: new Date('2025-03-20T10:15:00Z'), xactimateUnitPriceTotal: 31200, calculatedPayout: 31200, benefitStatus: 'NETWORK_100' } });

  await prisma.claim.create({ data: { policyholderId: phP2.id, addressLine1: '7650 Red Rd', city: 'South Miami', state: 'FL', zip: '33143', latitude: 25.708, longitude: -80.292, perilType: 'Structural', description: 'Foundation settling causing cracking in exterior stucco walls and interior drywall.', status: ClaimStatus.CLOSED, assignedContractorId: cProfiles[5].id, assignedAt: new Date('2024-08-05T08:45:00Z'), inspectionCompletedAt: new Date('2024-08-06T11:00:00Z'), closedAt: new Date('2024-09-15T14:00:00Z'), xactimateUnitPriceTotal: 55000, calculatedPayout: 44000, benefitStatus: 'CASH_80' } });

  await prisma.claim.create({ data: { policyholderId: phP1.id, addressLine1: '456 Giralda Ave', city: 'Coral Gables', state: 'FL', zip: '33134', latitude: 25.750, longitude: -80.258, perilType: 'Water Damage', description: 'AC condensate line overflow. Water damage to ceiling and walls.', status: ClaimStatus.CHECKED_IN, assignedContractorId: cProfiles[3].id, assignedAt: new Date('2025-04-01T13:00:00Z'), xactimateUnitPriceTotal: 12800, calculatedPayout: 12800, benefitStatus: 'NETWORK_100' } });

  // BLASTING claims
  const blast1 = await prisma.claim.create({ data: { policyholderId: phP1.id, addressLine1: '3100 Ponce de Leon Blvd', city: 'Coral Gables', state: 'FL', zip: '33134', latitude: 25.748, longitude: -80.257, perilType: 'Hurricane', description: 'Post-storm roof inspection needed. Wind damage suspected to clay tile roof. Gutters detached on south face.', status: ClaimStatus.BLASTING, xactimateUnitPriceTotal: 38000, benefitStatus: 'NETWORK_100' } });

  const blast2 = await prisma.claim.create({ data: { policyholderId: phP2.id, addressLine1: '5421 SW 82nd St', city: 'Miami', state: 'FL', zip: '33143', latitude: 25.702, longitude: -80.285, perilType: 'Water Damage', description: 'Emergency water extraction. Hot water heater failure flooding utility room and bedroom.', status: ClaimStatus.BLASTING, xactimateUnitPriceTotal: 22500, benefitStatus: 'NETWORK_100' } });

  // Dispatch logs for blasting claims
  const vetted = cProfiles.filter((_, i) => cData[i].v && !cData[i].f);
  for (const cp of vetted) {
    await prisma.dispatchLog.create({ data: { claimId: blast1.id, blastId: `blast-${blast1.id.slice(0,8)}`, contractorId: cp.id, outcome: DispatchOutcome.PENDING } });
    await prisma.dispatchLog.create({ data: { claimId: blast2.id, blastId: `blast-${blast2.id.slice(0,8)}`, contractorId: cp.id, outcome: DispatchOutcome.PENDING } });
  }

  // Historical dispatch logs
  await prisma.dispatchLog.create({ data: { claimId: cl1.id, blastId: 'hist-1', contractorId: cProfiles[1].id, notifiedAt: new Date('2024-10-15T08:00:00Z'), acceptedAt: new Date('2024-10-15T09:30:00Z'), outcome: DispatchOutcome.ACCEPTED } });
  await prisma.dispatchLog.create({ data: { claimId: cl2.id, blastId: 'hist-2', contractorId: cProfiles[0].id, notifiedAt: new Date('2025-01-08T10:00:00Z'), acceptedAt: new Date('2025-01-08T11:00:00Z'), outcome: DispatchOutcome.ACCEPTED } });

  // Pending contractors
  await prisma.pendingContractor.create({ data: { name: 'Ricardo Fuentes', companyName: 'Fuentes Emergency Plumbing', email: 'ricardo@fuentesplumbing.com', phone: '(305) 555-0891', tradeType: ContractorTradeType.WATER, coverageAreaText: 'Homestead, Cutler Bay, Palmetto Bay', tosStatus: TosStatus.SIGNED, tosSignature: 'Ricardo Fuentes - Signed 04/01/2025', submittedByPolicyholderId: phP1.id } });
  await prisma.pendingContractor.create({ data: { name: 'Camila Ortiz', companyName: 'Ortiz Roofing Contractors', email: 'camila@ortizroofing.com', phone: '(786) 555-0234', tradeType: ContractorTradeType.ROOF, coverageAreaText: 'Doral, Sweetwater, Hialeah', tosStatus: TosStatus.SENT } });
  await prisma.pendingContractor.create({ data: { name: 'Manuel Gutierrez', companyName: 'Gutierrez Structural Repair', email: 'manuel@gutierrezstructural.com', phone: '(305) 555-0567', tradeType: ContractorTradeType.STRUCTURAL, coverageAreaText: 'Kendall, Pinecrest, Dadeland', tosStatus: TosStatus.SIGNED, tosSignature: 'Manuel Gutierrez - Signed 03/28/2025', submittedByPolicyholderId: phP2.id } });

  console.log('✅ Seed complete!');
  console.log('   3 admins, 2 policyholders, 10 contractors, 7 claims, 3 pending');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
