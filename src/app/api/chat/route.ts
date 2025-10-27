import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const session = await getSession(req);
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title } = await req.json();

    const inspection = await prisma.inspection.create({
        data: {
            userId: session.userId,
            title,
        },
    });

    return NextResponse.json(inspection);
}