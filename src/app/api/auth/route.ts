import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { setDemoUser, clearDemoUser } from '@/lib/auth';
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    await setDemoUser(user.id);
    const redir: Record<string,string> = { POLICYHOLDER:'/policyholder/dashboard', CONTRACTOR:'/contractor/dashboard', ADMIN:'/admin/dashboard' };
    return NextResponse.json({ name: user.name, role: user.role, redirect: redir[user.role] || '/login' });
  } catch { return NextResponse.json({ error: 'Internal error' }, { status: 500 }); }
}
export async function DELETE() { await clearDemoUser(); return NextResponse.json({ ok: true }); }
