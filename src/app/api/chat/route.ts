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

export async function GET(req: NextRequest) {
    const session = await getSession(req);
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const inspections = await prisma.inspection.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
    });

    // remove userId property from each inspection object to prevent exposing sensitive information
    const sanitizedInspections = inspections.map(inspection => {
        const { userId, ...rest } = inspection;
        return rest;
    });

    return NextResponse.json({ chats: sanitizedInspections });
}

export async function DELETE(req: NextRequest) {
    const session = await getSession(req);
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await req.json();

    const inspection = await prisma.inspection.findUnique({
        where: { id },
    });

    if (!inspection || inspection.userId !== session.userId) {
        return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    await prisma.inspection.delete({
        where: { id },
    });

    return NextResponse.json({ success: true });
}