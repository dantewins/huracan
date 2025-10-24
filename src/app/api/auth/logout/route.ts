import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST() {
    const cookieStore = cookies();
    const sessionId = (await cookieStore).get('sessionId')?.value;

    if (sessionId) {
        await prisma.session.delete({ where: { id: sessionId } }).catch(() => { });
        (await cookieStore).delete('sessionId');
    }

    return NextResponse.json({ message: 'Logged out' });
}