import { cookies } from 'next/headers';
import { prisma } from './db';
import { redirect } from 'next/navigation';
const COOKIE = 'champion_demo_user';
export async function setDemoUser(userId: string) {
  try { const c = cookies(); c.set(COOKIE, userId, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 604800, path: '/' }); } catch {}
}
export async function clearDemoUser() { try { const c = cookies(); c.delete(COOKIE); } catch {} }
export async function getDemoUser() {
  try {
    const c = cookies();
    const uid = c.get(COOKIE)?.value;
    if (!uid) return null;
    return await prisma.user.findUnique({ where: { id: uid }, include: { policyholderProfile: true, contractorProfile: true } });
  } catch { return null; }
}
export async function requireUser() { const u = await getDemoUser(); if (!u) redirect('/login'); return u; }
export async function requireRole(role: 'POLICYHOLDER' | 'CONTRACTOR' | 'ADMIN') {
  const u = await requireUser(); if (u.role !== role) redirect(`/${u.role.toLowerCase()}/dashboard`); return u;
}