import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await getSession(req);
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const inspectionId = searchParams.get('inspectionId');

    if (!inspectionId) {
        return NextResponse.json({ error: 'inspectionId is required' }, { status: 400 });
    }

    const inspection = await prisma.inspection.findUnique({
        where: { id: inspectionId },
    });

    if (!inspection || inspection.userId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden: You do not own this inspection' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
        where: { inspectionId },
        orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
    const session = await getSession(req);
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { inspectionId, role, content, images } = await req.json();

    console.log(inspectionId)

    if (!inspectionId) {
        return NextResponse.json({ error: 'inspectionId is required' }, { status: 400 });
    }

    const inspection = await prisma.inspection.findUnique({
        where: { id: inspectionId },
    });

    if (!inspection || inspection.userId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden: You do not own this inspection' }, { status: 403 });
    }

    const message = await prisma.message.create({
        data: {
            inspectionId,
            role,
            content,
            images,
        },
    });

    return NextResponse.json(message);
}