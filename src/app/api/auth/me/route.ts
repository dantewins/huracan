
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    const cookieStore = cookies();
    const sessionId = (await cookieStore).get('sessionId')?.value;

    if (!sessionId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
    });

    if (!session || session.expires < new Date()) {
        if (session) {
            await prisma.session.delete({ where: { id: sessionId } });
        }
        (await cookieStore).delete('sessionId');
        return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
    }

    const user = {
        name: session.user.name,
        id: session.user.id,
        email: session.user.email,
    };

    return NextResponse.json(user);
}