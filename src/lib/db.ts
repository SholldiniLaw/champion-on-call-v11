import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const makePrisma = () => {
  try {
    return new PrismaClient();
  } catch {
    return new PrismaClient();
  }
};

export const prisma = globalForPrisma.prisma ?? makePrisma();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;