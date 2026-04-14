-- CreateEnum
CREATE TYPE "Role" AS ENUM ('POLICYHOLDER', 'CONTRACTOR', 'ADMIN');
CREATE TYPE "ContractorTradeType" AS ENUM ('WATER', 'ROOF', 'STRUCTURAL');
CREATE TYPE "TosStatus" AS ENUM ('SENT', 'SIGNED', 'VETTED');
CREATE TYPE "BenefitStatus" AS ENUM ('NETWORK_100', 'CASH_80');
CREATE TYPE "ClaimStatus" AS ENUM ('REPORTED', 'BLASTING', 'ASSIGNED', 'CHECKED_IN', 'INSPECTION_COMPLETE', 'CLOSED');
CREATE TYPE "DispatchOutcome" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'DECLINED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PolicyholderProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "defaultAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PolicyholderProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContractorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "tradeType" "ContractorTradeType" NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "radiusKm" INTEGER NOT NULL DEFAULT 50,
    "tosStatus" "TosStatus" NOT NULL DEFAULT 'SENT',
    "isVetted" BOOLEAN NOT NULL DEFAULT false,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "communicationRating" DECIMAL(3,2) NOT NULL DEFAULT 3.0,
    "professionalismRating" DECIMAL(3,2) NOT NULL DEFAULT 3.0,
    "punctualityRating" DECIMAL(3,2) NOT NULL DEFAULT 3.0,
    "cleanlinessRating" DECIMAL(3,2) NOT NULL DEFAULT 3.0,
    "qualityRating" DECIMAL(3,2) NOT NULL DEFAULT 3.0,
    "championScore" DECIMAL(3,2) NOT NULL DEFAULT 3.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ContractorProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "policyholderId" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'FL',
    "zip" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "perilType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "benefitStatus" "BenefitStatus" NOT NULL DEFAULT 'NETWORK_100',
    "status" "ClaimStatus" NOT NULL DEFAULT 'REPORTED',
    "assignedContractorId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "inspectionCompletedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "xactimateUnitPriceTotal" DECIMAL(12,2),
    "calculatedPayout" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DispatchLog" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "blastId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "notifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "outcome" "DispatchOutcome" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DispatchLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PendingContractor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "tradeType" "ContractorTradeType" NOT NULL,
    "coverageAreaText" TEXT,
    "tosSignature" TEXT,
    "tosStatus" "TosStatus" NOT NULL DEFAULT 'SENT',
    "submittedByPolicyholderId" TEXT,
    "reviewedByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PendingContractor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "PolicyholderProfile_userId_key" ON "PolicyholderProfile"("userId");
CREATE UNIQUE INDEX "ContractorProfile_userId_key" ON "ContractorProfile"("userId");

-- AddForeignKey
ALTER TABLE "PolicyholderProfile" ADD CONSTRAINT "PolicyholderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContractorProfile" ADD CONSTRAINT "ContractorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_policyholderId_fkey" FOREIGN KEY ("policyholderId") REFERENCES "PolicyholderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_assignedContractorId_fkey" FOREIGN KEY ("assignedContractorId") REFERENCES "ContractorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DispatchLog" ADD CONSTRAINT "DispatchLog_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DispatchLog" ADD CONSTRAINT "DispatchLog_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "ContractorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PendingContractor" ADD CONSTRAINT "PendingContractor_submittedByPolicyholderId_fkey" FOREIGN KEY ("submittedByPolicyholderId") REFERENCES "PolicyholderProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PendingContractor" ADD CONSTRAINT "PendingContractor_reviewedByAdminId_fkey" FOREIGN KEY ("reviewedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
